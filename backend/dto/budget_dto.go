package dto

type BudgetResponse struct {
	Amount         float64 `json:"amount"`
	MonthlyExpense float64 `json:"monthly_expense"`
	Configured     bool    `json:"configured"`
}

type UpdateBudgetRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}
