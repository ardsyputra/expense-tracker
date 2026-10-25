package repositories

import (
	"expense-tracker-api/config"
	"expense-tracker-api/models"
)

type DashboardRepository struct {
}

func NewDashboardRepository() *DashboardRepository {
	return &DashboardRepository{}
}

func (r *DashboardRepository) GetTotalIncome(userID uint) (float64, error) {

	var total float64

	err := config.DB.
		Model(&models.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "income").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error

	return total, err
}

func (r *DashboardRepository) GetTotalExpense(userID uint) (float64, error) {

	var total float64

	err := config.DB.
		Model(&models.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "expense").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error

	return total, err
}