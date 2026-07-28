package main

import (
	"expense-tracker-api/config"
	"expense-tracker-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	config.ConnectDatabase()

	r := gin.Default()

	routes.AuthRoutes(r)

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Expense Tracker API",
		})
	})

	r.Run(":8080")
}