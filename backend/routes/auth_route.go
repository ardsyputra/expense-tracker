package routes

import (
	"expense-tracker-api/controllers"
	"expense-tracker-api/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}


	profile := r.Group("/api/profile")
	profile.Use(middleware.JWTMiddleware())
	{

		profile.GET(
			"",
			controllers.Profile,
		)

		profile.PUT(
			"",
			controllers.UpdateProfile,
		)

	}

}