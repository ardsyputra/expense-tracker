package controllers

import (
	"net/http"

	"expense-tracker-api/response"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	Service *services.DashboardService
}

func NewDashboardController(
	service *services.DashboardService,
) *DashboardController {
	return &DashboardController{
		Service: service,
	}
}

// GetDashboardSummary godoc
// @Summary Get dashboard summary
// @Description Mengambil total income, expense, dan balance milik user
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/dashboard/summary [get]
func (c *DashboardController) GetSummary(ctx *gin.Context) {

	userID := ctx.GetUint("user_id")

	summary, err := c.Service.GetSummary(userID)

	if err != nil {
		response.Error(
			ctx,
			http.StatusInternalServerError,
			"Gagal mengambil dashboard summary",
		)
		return
	}

	response.Success(
		ctx,
		"Dashboard summary",
		summary,
	)
}