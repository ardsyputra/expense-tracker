package repositories

import (
	"expense-tracker-api/dto"
	"expense-tracker-api/models"

	"gorm.io/gorm"
)

type TransactionRepository struct {
	DB *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{
		DB: db,
	}
}

func (r *TransactionRepository) Create(transaction *models.Transaction) error {
	return r.DB.Create(transaction).Error
}

func (r *TransactionRepository) FindAllByUserID(userID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction

	err := r.DB.
		Preload("Category").
		Where("user_id = ?", userID).
		Order("date DESC").
		Find(&transactions).Error

	return transactions, err
}

func (r *TransactionRepository) FindByIDAndUserID(
	id uint,
	userID uint,
) (*models.Transaction, error) {

	var transaction models.Transaction

	err := r.DB.
		Preload("Category").
		Where("id = ? AND user_id = ?", id, userID).
		First(&transaction).Error

	if err != nil {
		return nil, err
	}

	return &transaction, nil
}

func (r *TransactionRepository) Update(transaction *models.Transaction) error {
	return r.DB.
		Model(&models.Transaction{}).
		Where("id = ? AND user_id = ?", transaction.ID, transaction.UserID).
		Updates(map[string]interface{}{
			"category_id": transaction.CategoryID,
			"title":       transaction.Title,
			"amount":      transaction.Amount,
			"type":        transaction.Type,
			"description": transaction.Description,
			"date":        transaction.Date,
		}).Error
}

func (r *TransactionRepository) Delete(transaction *models.Transaction) error {
	return r.DB.Delete(transaction).Error
}

// FindAllByUserIDWithFilter
func (r *TransactionRepository) FindAllByUserIDWithFilter(
	userID uint,
	filter dto.TransactionFilterRequest,
) ([]models.Transaction, int64, error) {

	var transactions []models.Transaction
	var total int64

	query := r.DB.
		Model(&models.Transaction{}).
		Where("user_id = ?", userID)

	// Filter berdasarkan type
	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	// Filter tanggal mulai
	if filter.StartDate != "" {
		query = query.Where("date >= ?", filter.StartDate)
	}

	// Filter tanggal akhir
	if filter.EndDate != "" {
		query = query.Where(
			"date <= ?",
			filter.EndDate+" 23:59:59",
		)
	}

	// Hitung total sebelum pagination
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (filter.Page - 1) * filter.Limit

	err := query.
		Preload("Category").
		Order("date DESC").
		Limit(filter.Limit).
		Offset(offset).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}
