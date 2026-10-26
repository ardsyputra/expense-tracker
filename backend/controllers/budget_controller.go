package controllers

import (
	"errors"
	"net/http"

	"expense-tracker-api/dto"
	"expense-tracker-api/response"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BudgetController struct {
	Service *services.BudgetService
}

func NewBudgetController(service *services.BudgetService) *BudgetController {
	return &BudgetController{Service: service}
}

func (c *BudgetController) GetMonthlyBudget(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	budget, err := c.Service.GetMonthlyBudget(userID)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Gagal mengambil budget bulanan")
		return
	}

	response.Success(ctx, "Budget bulanan", budget)
}

func (c *BudgetController) SetBudget(ctx *gin.Context) {
	var request dto.UpdateBudgetRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	if err := c.Service.SetBudget(ctx.GetUint("user_id"), request.Amount); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Gagal menyimpan budget bulanan")
		return
	}

	budget, err := c.Service.GetMonthlyBudget(ctx.GetUint("user_id"))
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "Budget tersimpan tetapi gagal mengambil ringkasannya")
		return
	}

	response.Success(ctx, "Budget bulanan berhasil disimpan", budget)
}

func (c *BudgetController) ClearBudget(ctx *gin.Context) {
	if err := c.Service.ClearBudget(ctx.GetUint("user_id")); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(ctx, http.StatusNotFound, "Budget bulanan belum diatur")
			return
		}
		response.Error(ctx, http.StatusInternalServerError, "Gagal menghapus budget bulanan")
		return
	}

	response.Success(ctx, "Budget bulanan berhasil dihapus", nil)
}
