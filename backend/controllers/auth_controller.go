package controllers

import (
	"net/http"

	"expense-tracker-api/dto"
	"expense-tracker-api/response"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {

	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	err := services.Register(req)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "User berhasil dibuat", nil)
}