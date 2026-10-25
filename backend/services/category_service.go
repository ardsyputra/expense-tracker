package services

import (
	"expense-tracker-api/dto"
	"expense-tracker-api/models"
	"expense-tracker-api/repositories"
)

func CreateCategory(userID uint, req dto.CreateCategoryRequest) error {

	category := models.Category{
		Name:   req.Name,
		Type:   req.Type,
		UserID: userID,
	}

	return repositories.CreateCategory(&category)
}

func GetCategories(userID uint) ([]models.Category, error) {

	return repositories.GetCategoriesByUserID(userID)
}

func GetCategoryByID(id uint, userID uint) (*models.Category, error) {

	return repositories.GetCategoryByID(id, userID)
}

func UpdateCategory(
	id uint,
	userID uint,
	req dto.UpdateCategoryRequest,
) (*models.Category, error) {

	category, err := repositories.GetCategoryByID(id, userID)

	if err != nil {
		return nil, err
	}

	category.Name = req.Name
	category.Type = req.Type

	err = repositories.UpdateCategory(category)

	if err != nil {
		return nil, err
	}

	return category, nil
}

func DeleteCategory(id uint, userID uint) error {

	category, err := repositories.GetCategoryByID(id, userID)

	if err != nil {
		return err
	}

	return repositories.DeleteCategory(category)
}