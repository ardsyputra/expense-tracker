package services

import (
	"errors"

	"expense-tracker-api/dto"
	"expense-tracker-api/models"
	"expense-tracker-api/repositories"

	"golang.org/x/crypto/bcrypt"
)

func Register(req dto.RegisterRequest) error {

	// Cek email sudah ada atau belum
	user, _ := repositories.GetUserByEmail(req.Email)
	if user.ID != 0 {
		return errors.New("email sudah digunakan")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	newUser := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	return repositories.CreateUser(&newUser)
}