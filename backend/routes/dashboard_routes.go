package routes

import (
	"expense-tracker-api/controllers"
	"expense-tracker-api/middleware"
	"expense-tracker-api/repositories"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

func DashboardRoutes(r *gin.Engine) {

	repository := repositories.NewDashboardRepository()

	service := services.NewDashboardService(
		repository,
	)

	controller := controllers.NewDashboardController(
		service,
	)

	dashboard := r.Group("/api/dashboard")

	dashboard.Use(middleware.JWTMiddleware())

	{
		dashboard.GET(
			"/summary",
			controller.GetSummary,
		)
	}
}