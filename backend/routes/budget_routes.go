package routes

import (
	"expense-tracker-api/config"
	"expense-tracker-api/controllers"
	"expense-tracker-api/middleware"
	"expense-tracker-api/repositories"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

func BudgetRoutes(r *gin.Engine) {
	repository := repositories.NewBudgetRepository(config.DB)
	service := services.NewBudgetService(repository)
	controller := controllers.NewBudgetController(service)

	budget := r.Group("/api/budget")
	budget.Use(middleware.JWTMiddleware())
	{
		budget.GET("", controller.GetMonthlyBudget)
		budget.PUT("", controller.SetBudget)
		budget.DELETE("", controller.ClearBudget)
	}
}
