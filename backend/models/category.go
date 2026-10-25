package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model

	Name   string `json:"name"`
	Type   string `json:"type"` // income atau expense
	UserID uint   `json:"user_id"`
}