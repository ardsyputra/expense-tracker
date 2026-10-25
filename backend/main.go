
package main

import (
	"net/http"
	"os"
	"strings"

	"expense-tracker-api/config"
	"expense-tracker-api/routes"

	_ "expense-tracker-api/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Expense Tracker API
// @version 1.0
// @description REST API untuk aplikasi Expense Tracker
// @host localhost:8080
// @BasePath /
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Masukkan JWT token dengan format: Bearer <token>

func main() {

	// =========================
	// DATABASE
	// =========================
	config.ConnectDatabase()

	// =========================
	// REDIS
	// =========================
	config.ConnectRedis()

	// =========================
	// GIN
	// =========================
	r := gin.Default()

	// =========================
	// CORS
	// =========================
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins: strings.Split(allowedOrigins, ","),
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
	}))

	// =========================
	// ROUTES
	// =========================
	routes.AuthRoutes(r)
	routes.CategoryRoutes(r)
	routes.TransactionRoutes(r)
	routes.DashboardRoutes(r)

	// =========================
	// ROOT
	// =========================
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Expense Tracker API",
		})
	})

	// =========================
	// SWAGGER
	// =========================
	r.GET(
		"/swagger/*any",
		ginSwagger.WrapHandler(swaggerFiles.Handler),
	)

	// =========================
	// SERVER
	// =========================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
