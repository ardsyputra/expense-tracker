package services

import (
	"errors"

	"expense-tracker-api/dto"
	"expense-tracker-api/models"
	"expense-tracker-api/repositories"
	"expense-tracker-api/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// =====================================================
// REGISTER
// =====================================================

func Register(req dto.RegisterRequest) error {

	// Cek email
	user, err := repositories.GetUserByEmail(req.Email)

	if err == nil && user.ID != 0 {
		return errors.New("email sudah digunakan")
	}

	// Kalau error bukan karena data tidak ditemukan,
	// berarti ada masalah database.
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	// Buat user baru
	newUser := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	return repositories.CreateUser(&newUser)
}

// =====================================================
// LOGIN
// =====================================================

func Login(req dto.LoginRequest) (string, error) {

	user, err := repositories.GetUserByEmail(req.Email)

	if err != nil {
		return "", errors.New(
			"email atau password salah",
		)
	}

	// Cek password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(req.Password),
	)

	if err != nil {
		return "", errors.New(
			"email atau password salah",
		)
	}

	// Generate JWT
	token, err := utils.GenerateToken(
		user.ID,
		user.Email,
	)

	if err != nil {
		return "", err
	}

	return token, nil
}

// =====================================================
// UPDATE PROFILE
// =====================================================

func GetProfile(userID uint) (*dto.ProfileResponse, error) {
	user, err := repositories.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	return &dto.ProfileResponse{
		UserID: user.ID,
		Name:   user.Name,
		Email:  user.Email,
	}, nil
}

func UpdateProfile(
	userID uint,
	req dto.UpdateProfileRequest,
) (string, error) {

	// -------------------------------------------------
	// 1. Ambil user berdasarkan ID JWT
	// -------------------------------------------------

	user, err := repositories.GetUserByID(userID)

	if err != nil {
		return "", errors.New(
			"user tidak ditemukan",
		)
	}

	// -------------------------------------------------
	// 2. Validasi nama
	// -------------------------------------------------

	if req.Name == "" {
		return "", errors.New(
			"nama tidak boleh kosong",
		)
	}

	// -------------------------------------------------
	// 3. Validasi email
	// -------------------------------------------------

	if req.Email == "" {
		return "", errors.New(
			"email tidak boleh kosong",
		)
	}

	// Kalau email berubah
	if req.Email != user.Email {

		existingUser, err := repositories.GetUserByEmail(
			req.Email,
		)

		// Email sudah digunakan user lain
		if err == nil && existingUser.ID != user.ID {
			return "", errors.New(
				"email sudah digunakan",
			)
		}

		// Kalau error bukan "record not found",
		// berarti kemungkinan ada masalah database.
		if err != nil &&
			!errors.Is(err, gorm.ErrRecordNotFound) {
			return "", err
		}

		user.Email = req.Email
	}

	// -------------------------------------------------
	// 4. Update nama
	// -------------------------------------------------

	user.Name = req.Name

	// -------------------------------------------------
	// 5. Update password jika diminta
	// -------------------------------------------------

	if req.NewPassword != "" {

		// Password lama wajib diisi
		if req.CurrentPassword == "" {
			return "", errors.New(
				"password saat ini wajib diisi",
			)
		}

		// Password baru minimal 8 karakter
		if len(req.NewPassword) < 8 {
			return "", errors.New(
				"password baru minimal 8 karakter",
			)
		}

		// Password baru tidak boleh sama
		// dengan password lama
		if req.CurrentPassword == req.NewPassword {
			return "", errors.New(
				"password baru harus berbeda dari password lama",
			)
		}

		// Cek password lama
		err = bcrypt.CompareHashAndPassword(
			[]byte(user.Password),
			[]byte(req.CurrentPassword),
		)

		if err != nil {
			return "", errors.New(
				"password saat ini salah",
			)
		}

		// Hash password baru
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(req.NewPassword),
			bcrypt.DefaultCost,
		)

		if err != nil {
			return "", err
		}

		user.Password = string(hashedPassword)
	}

	// -------------------------------------------------
	// 6. Simpan perubahan
	// -------------------------------------------------

	err = repositories.UpdateUser(user)

	if err != nil {
		return "", errors.New(
			"gagal memperbarui profile",
		)
	}

	// -------------------------------------------------
	// 7. Generate JWT baru
	// -------------------------------------------------

	token, err := utils.GenerateToken(
		user.ID,
		user.Email,
	)

	if err != nil {
		return "", err
	}

	return token, nil
}
