package controllers

import (
	"net/http"

	"expense-tracker-api/dto"
	"expense-tracker-api/response"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary Register user
// @Description Membuat akun user baru
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/auth/register [post]
func Register(c *gin.Context) {

	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	err := services.Register(req)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "User berhasil dibuat", nil)
}

// Login godoc
// @Summary Login user
// @Description Login menggunakan email dan password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Request"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/auth/login [post]
func Login(c *gin.Context) {

	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := services.Login(req)

	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	response.Success(c, "Login berhasil", gin.H{
		"token": token,
	})
}

// =====================================================
// GET PROFILE
// =====================================================

// Profile godoc
// @Summary Get profile
// @Description Mengambil profile user yang sedang login
// @Tags Profile
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/profile [get]
func Profile(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		response.Error(
			c,
			http.StatusUnauthorized,
			"user tidak terautentikasi",
		)

		return
	}

	profile, err := services.GetProfile(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User tidak ditemukan")
		return
	}

	response.Success(c, "Profile berhasil diambil", profile)

}

// =====================================================
// UPDATE PROFILE
// =====================================================

// UpdateProfile godoc
// @Summary Update profile
// @Description Mengubah nama, email, dan password user yang sedang login
// @Tags Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.UpdateProfileRequest true "Update Profile Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/profile [put]
func UpdateProfile(c *gin.Context) {

	var req dto.UpdateProfileRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)

		return
	}

	userID := c.GetUint("user_id")

	if userID == 0 {

		response.Error(
			c,
			http.StatusUnauthorized,
			"user tidak terautentikasi",
		)

		return
	}

	token, err := services.UpdateProfile(
		userID,
		req,
	)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(
		c,
		"Profile berhasil diperbarui",
		gin.H{

			"token": token,
		},
	)

}
