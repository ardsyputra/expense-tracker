package controllers

import (
	"errors"
	"math"
	"net/http"
	"strconv"

	"expense-tracker-api/dto"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransactionController struct {
	Service *services.TransactionService
}

func NewTransactionController(
	service *services.TransactionService,
) *TransactionController {
	return &TransactionController{
		Service: service,
	}
}

// CreateTransaction
// @Summary Create transaction
// @Description Membuat transaksi income atau expense
// @Tags Transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateTransactionRequest true "Transaction data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/transactions [post]
func (c *TransactionController) CreateTransaction(ctx *gin.Context) {

	userIDValue, exists := ctx.Get("user_id")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User tidak terautentikasi",
		})
		return
	}

	userID, ok := userIDValue.(uint)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID tidak valid",
		})
		return
	}

	var req dto.CreateTransactionRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	transaction, err := c.Service.Create(userID, req)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaksi berhasil dibuat",
		"data":    transaction,
	})
}

// GetTransactions
// @Summary Get all transactions
// @Description Mengambil transaksi milik user dengan pagination dan filter
// @Tags Transactions
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param type query string false "Transaction type: income or expense"
// @Param start_date query string false "Start date YYYY-MM-DD"
// @Param end_date query string false "End date YYYY-MM-DD"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/transactions [get]
func (c *TransactionController) GetTransactions(ctx *gin.Context) {

	userIDValue, exists := ctx.Get("user_id")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User tidak terautentikasi",
		})
		return
	}

	userID, ok := userIDValue.(uint)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID tidak valid",
		})
		return
	}

	var filter dto.TransactionFilterRequest

	if err := ctx.ShouldBindQuery(&filter); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Default page
	if filter.Page <= 0 {
		filter.Page = 1
	}

	// Default limit
	if filter.Limit <= 0 {
		filter.Limit = 10
	}

	// Maksimal 100 transaksi per request
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	// Validasi type
	if filter.Type != "" &&
		filter.Type != "income" &&
		filter.Type != "expense" {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Type harus income atau expense",
		})
		return
	}

	transactions, total, err :=
		c.Service.GetAllWithFilter(userID, filter)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil transaksi",
		})
		return
	}

	totalPages := int(math.Ceil(
		float64(total) / float64(filter.Limit),
	))

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Daftar transaksi",
		"data":    transactions,
		"pagination": gin.H{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// GetTransactionByID
// @Summary Get transaction by ID
// @Description Mengambil detail transaksi berdasarkan ID
// @Tags Transactions
// @Produce json
// @Security BearerAuth
// @Param id path int true "Transaction ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/transactions/{id} [get]
func (c *TransactionController) GetTransactionByID(ctx *gin.Context) {

	userIDValue, exists := ctx.Get("user_id")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User tidak terautentikasi",
		})
		return
	}

	userID, ok := userIDValue.(uint)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID tidak valid",
		})
		return
	}

	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID transaksi tidak valid",
		})
		return
	}

	transaction, err := c.Service.GetByID(userID, uint(id))

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Transaksi tidak ditemukan",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Detail transaksi berhasil diambil",
		"data":    transaction,
	})
}

// UpdateTransaction
// @Summary Update transaction
// @Description Mengubah transaksi berdasarkan ID
// @Tags Transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Transaction ID"
// @Param request body dto.UpdateTransactionRequest true "Transaction data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/transactions/{id} [put]
func (c *TransactionController) UpdateTransaction(ctx *gin.Context) {

	userIDValue, exists := ctx.Get("user_id")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User tidak terautentikasi",
		})
		return
	}

	userID, ok := userIDValue.(uint)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID tidak valid",
		})
		return
	}

	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID transaksi tidak valid",
		})
		return
	}

	var req dto.UpdateTransactionRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	transaction, err := c.Service.Update(userID, uint(id), req)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaksi berhasil diperbarui",
		"data":    transaction,
	})
}

// DeleteTransaction
// @Summary Delete transaction
// @Description Menghapus transaksi berdasarkan ID
// @Tags Transactions
// @Produce json
// @Security BearerAuth
// @Param id path int true "Transaction ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/transactions/{id} [delete]
func (c *TransactionController) DeleteTransaction(ctx *gin.Context) {

	userIDValue, exists := ctx.Get("user_id")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User tidak terautentikasi",
		})
		return
	}

	userID, ok := userIDValue.(uint)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID tidak valid",
		})
		return
	}

	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "ID transaksi tidak valid",
		})
		return
	}

	err = c.Service.Delete(userID, uint(id))

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Transaksi tidak ditemukan",
			})
			return
		}

		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaksi berhasil dihapus",
		"data":    nil,
	})
}