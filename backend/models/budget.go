package models

import "gorm.io/gorm"

type Budget struct {
	gorm.Model

	UserID uint    `gorm:"uniqueIndex;not null" json:"user_id"`
	Amount float64 `gorm:"not null" json:"amount"`
}
