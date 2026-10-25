package repositories

import (
	"expense-tracker-api/config"
	"expense-tracker-api/models"
)

func CreateCategory(category *models.Category) error {
	return config.DB.Create(category).Error
}

func GetCategoriesByUserID(userID uint) ([]models.Category, error) {

	var categories []models.Category

	err := config.DB.
		Where("user_id = ?", userID).
		Find(&categories).Error

	return categories, err
}

func GetCategoryByID(id uint, userID uint) (*models.Category, error) {

	var category models.Category

	err := config.DB.
		Where("id = ? AND user_id = ?", id, userID).
		First(&category).Error

	if err != nil {
		return nil, err
	}

	return &category, nil
}

func UpdateCategory(category *models.Category) error {

	return config.DB.Save(category).Error

}

func DeleteCategory(category *models.Category) error {

	return config.DB.Delete(category).Error
}