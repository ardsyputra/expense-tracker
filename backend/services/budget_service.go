package services

import (
	"errors"
	"time"

	"expense-tracker-api/dto"
	"expense-tracker-api/repositories"

	"gorm.io/gorm"
)

type BudgetService struct {
	Repository *repositories.BudgetRepository
}

func NewBudgetService(repository *repositories.BudgetRepository) *BudgetService {
	return &BudgetService{Repository: repository}
}

func (s *BudgetService) GetMonthlyBudget(userID uint) (*dto.BudgetResponse, error) {
	location := time.FixedZone("WIB", 7*60*60)
	now := time.Now().In(location)
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, location)
	end := start.AddDate(0, 1, 0)

	monthlyExpense, err := s.Repository.GetMonthlyExpense(userID, start, end)
	if err != nil {
		return nil, err
	}

	response := &dto.BudgetResponse{
		MonthlyExpense: monthlyExpense,
	}

	budget, err := s.Repository.FindByUserID(userID)
	if err == nil {
		response.Amount = budget.Amount
		response.Configured = true
		return response, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	return response, nil
}

func (s *BudgetService) SetBudget(userID uint, amount float64) error {
	return s.Repository.SaveForUser(userID, amount)
}

func (s *BudgetService) ClearBudget(userID uint) error {
	return s.Repository.DeleteForUser(userID)
}
