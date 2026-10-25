package routes

import (
	"expense-tracker-api/config"
	"expense-tracker-api/controllers"
	"expense-tracker-api/middleware"
	"expense-tracker-api/repositories"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

func TransactionRoutes(r *gin.Engine) {

	transactionRepository :=
		repositories.NewTransactionRepository(config.DB)

	transactionService :=
		services.NewTransactionService(
			transactionRepository,
			config.DB,
		)

	transactionController :=
		controllers.NewTransactionController(transactionService)

	transactionRoutes := r.Group("/api/transactions")

	transactionRoutes.Use(middleware.JWTMiddleware())

	{
		transactionRoutes.POST(
			"",
			transactionController.CreateTransaction,
		)

		transactionRoutes.GET(
			"",
			transactionController.GetTransactions,
		)

		transactionRoutes.GET(
			"/:id",
			transactionController.GetTransactionByID,
		)

		transactionRoutes.PUT(
			"/:id",
			transactionController.UpdateTransaction,
		)

		transactionRoutes.DELETE(
			"/:id",
			transactionController.DeleteTransaction,
		)
	}
}