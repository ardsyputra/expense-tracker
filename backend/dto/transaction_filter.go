package dto

type TransactionFilterRequest struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Type      string `form:"type"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
