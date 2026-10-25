package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model

	UserID uint `json:"user_id"`

	CategoryID uint `json:"category_id"`

	Category Category `json:"category"`

	Title string `json:"title"`

	Amount float64 `json:"amount"`

	Type string `json:"type"`

	Description string `json:"description"`

	Date time.Time `json:"date"`
}
