package routes

import (
	"expense-tracker-api/controllers"
	"expense-tracker-api/middleware"

	"github.com/gin-gonic/gin"
)

func CategoryRoutes(r *gin.Engine) {

	category := r.Group("/api/categories")

	category.Use(middleware.JWTMiddleware())

	{
		category.POST("", controllers.CreateCategory)
		category.GET("", controllers.GetCategories)
		category.GET("/:id", controllers.GetCategoryByID)
		category.PUT("/:id", controllers.UpdateCategory)
		category.DELETE("/:id", controllers.DeleteCategory)
	}
}