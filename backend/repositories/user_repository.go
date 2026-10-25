
package repositories

import (
	"expense-tracker-api/config"
	"expense-tracker-api/models"
)

// =====================================================
// CREATE USER
// =====================================================

func CreateUser(user *models.User) error {
	return config.DB.Create(user).Error
}

// =====================================================
// GET USER BY EMAIL
// =====================================================

func GetUserByEmail(email string) (*models.User, error) {

	var user models.User

	err := config.DB.
		Where("email = ?", email).
		First(&user).
		Error

	return &user, err
}

// =====================================================
// GET USER BY ID
// =====================================================

func GetUserByID(id uint) (*models.User, error) {

	var user models.User

	err := config.DB.
		First(&user, id).
		Error

	return &user, err
}

// =====================================================
// UPDATE USER
// =====================================================

func UpdateUser(user *models.User) error {

	return config.DB.
		Model(&models.User{}).
		Where("id = ?", user.ID).
		Updates(map[string]interface{}{
			"name":     user.Name,
			"email":    user.Email,
			"password": user.Password,
		}).
		Error
}

