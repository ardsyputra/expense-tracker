package repositories

import (
	"time"

	"expense-tracker-api/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BudgetRepository struct {
	DB *gorm.DB
}

func NewBudgetRepository(db *gorm.DB) *BudgetRepository {
	return &BudgetRepository{DB: db}
}

func (r *BudgetRepository) FindByUserID(userID uint) (*models.Budget, error) {
	var budget models.Budget
	err := r.DB.Where("user_id = ?", userID).First(&budget).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

func (r *BudgetRepository) SaveForUser(userID uint, amount float64) error {
	budget := models.Budget{
		UserID: userID,
		Amount: amount,
	}

	return r.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"amount", "updated_at", "deleted_at"}),
	}).Create(&budget).Error
}

func (r *BudgetRepository) DeleteForUser(userID uint) error {
	result := r.DB.Where("user_id = ?", userID).Delete(&models.Budget{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *BudgetRepository) GetMonthlyExpense(
	userID uint,
	start time.Time,
	end time.Time,
) (float64, error) {
	var total float64
	err := r.DB.Model(&models.Transaction{}).
		Where(
			"user_id = ? AND type = ? AND date >= ? AND date < ?",
			userID,
			"expense",
			start,
			end,
		).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error

	return total, err
}
