package dto

type CreateTransactionRequest struct {
	Title       string  `json:"title" binding:"required"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"`
}

type UpdateTransactionRequest struct {
	Title       string  `json:"title" binding:"required"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"`
}
