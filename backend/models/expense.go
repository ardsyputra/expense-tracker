package models

import "time"

type Expense struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	CategoryID  uint      `gorm:"not null;index" json:"category_id"`
	Type        string    `gorm:"not null" json:"type"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `gorm:"not null" json:"date"`

	Category Category `gorm:"foreignKey:CategoryID" json:"category"`
}