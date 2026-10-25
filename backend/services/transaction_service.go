package services

import (
	"errors"
	"time"

	"expense-tracker-api/dto"
	"expense-tracker-api/models"
	"expense-tracker-api/repositories"
	"expense-tracker-api/utils"

	"gorm.io/gorm"
)

type TransactionService struct {
	TransactionRepo *repositories.TransactionRepository
	DB              *gorm.DB
}

func NewTransactionService(
	transactionRepo *repositories.TransactionRepository,
	db *gorm.DB,
) *TransactionService {
	return &TransactionService{
		TransactionRepo: transactionRepo,
		DB:              db,
	}
}

func (s *TransactionService) Create(
	userID uint,
	req dto.CreateTransactionRequest,
) (*models.Transaction, error) {

	// Pastikan category milik user yang sedang login
	var category models.Category

	err := s.DB.
		Where("id = ? AND user_id = ?", req.CategoryID, userID).
		First(&category).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("kategori tidak ditemukan")
		}

		return nil, err
	}

	// Pastikan type transaksi sama dengan type category
	if req.Type != category.Type {
		return nil, errors.New(
			"type transaksi tidak sesuai dengan type kategori",
		)
	}

	// Parsing tanggal
	transactionDate, err := time.Parse(
		"2006-01-02",
		req.Date,
	)

	if err != nil {
		return nil, errors.New(
			"format tanggal harus YYYY-MM-DD",
		)
	}

	transaction := &models.Transaction{
		UserID:      userID,
		Title:       req.Title,
		CategoryID:  req.CategoryID,
		Amount:      req.Amount,
		Type:        req.Type,
		Description: req.Description,
		Date:        transactionDate,
	}

	err = s.TransactionRepo.Create(transaction)

	if err != nil {
		return nil, err
	}

	// =========================
	// INVALIDATE DASHBOARD CACHE
	// =========================

	utils.InvalidateDashboardCache(userID)

	// Ambil kembali dengan Category
	createdTransaction, err :=
		s.TransactionRepo.FindByIDAndUserID(
			transaction.ID,
			userID,
		)

	if err != nil {
		return nil, err
	}

	return createdTransaction, nil
}

func (s *TransactionService) GetAll(
	userID uint,
) ([]models.Transaction, error) {

	return s.TransactionRepo.FindAllByUserID(userID)
}

func (s *TransactionService) GetAllWithFilter(
	userID uint,
	filter dto.TransactionFilterRequest,
) ([]models.Transaction, int64, error) {

	return s.TransactionRepo.FindAllByUserIDWithFilter(
		userID,
		filter,
	)
}

func (s *TransactionService) GetByID(
	userID uint,
	id uint,
) (*models.Transaction, error) {

	transaction, err :=
		s.TransactionRepo.FindByIDAndUserID(
			id,
			userID,
		)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New(
				"transaksi tidak ditemukan",
			)
		}

		return nil, err
	}

	return transaction, nil
}

func (s *TransactionService) Update(
	userID uint,
	id uint,
	req dto.UpdateTransactionRequest,
) (*models.Transaction, error) {

	transaction, err :=
		s.TransactionRepo.FindByIDAndUserID(
			id,
			userID,
		)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New(
				"transaksi tidak ditemukan",
			)
		}

		return nil, err
	}

	// Pastikan category milik user
	var category models.Category

	err = s.DB.
		Where(
			"id = ? AND user_id = ?",
			req.CategoryID,
			userID,
		).
		First(&category).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New(
				"kategori tidak ditemukan",
			)
		}

		return nil, err
	}

	// Pastikan type sesuai category
	if req.Type != category.Type {
		return nil, errors.New(
			"type transaksi tidak sesuai dengan type kategori",
		)
	}

	// Parsing tanggal
	transactionDate, err := time.Parse(
		"2006-01-02",
		req.Date,
	)

	if err != nil {
		return nil, errors.New(
			"format tanggal harus YYYY-MM-DD",
		)
	}

	transaction.CategoryID = req.CategoryID
	transaction.Title = req.Title
	transaction.Amount = req.Amount
	transaction.Type = req.Type
	transaction.Description = req.Description
	transaction.Date = transactionDate

	err = s.TransactionRepo.Update(transaction)

	if err != nil {
		return nil, err
	}

	// =========================
	// INVALIDATE DASHBOARD CACHE
	// =========================

	utils.InvalidateDashboardCache(userID)

	return s.TransactionRepo.FindByIDAndUserID(
		id,
		userID,
	)
}

func (s *TransactionService) Delete(
	userID uint,
	id uint,
) error {

	transaction, err :=
		s.TransactionRepo.FindByIDAndUserID(
			id,
			userID,
		)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New(
				"transaksi tidak ditemukan",
			)
		}

		return err
	}

	err = s.TransactionRepo.Delete(transaction)

	if err != nil {
		return err
	}

	// =========================
	// INVALIDATE DASHBOARD CACHE
	// =========================

	utils.InvalidateDashboardCache(userID)

	return nil
}
