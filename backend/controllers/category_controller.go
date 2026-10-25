package controllers

import (
	"net/http"
	"strconv"

	"expense-tracker-api/dto"
	"expense-tracker-api/response"
	"expense-tracker-api/services"

	"github.com/gin-gonic/gin"
)

// CreateCategory godoc
// @Summary Create category
// @Description Membuat kategori baru
// @Tags Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateCategoryRequest true "Create Category Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/categories [post]
func CreateCategory(c *gin.Context) {

	var req dto.CreateCategoryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetUint("user_id")

	err := services.CreateCategory(userID, req)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "Kategori berhasil dibuat", nil)
}

// GetCategories godoc
// @Summary Get all categories
// @Description Mengambil semua kategori milik user
// @Tags Categories
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/categories [get]
func GetCategories(c *gin.Context) {

	userID := c.GetUint("user_id")

	categories, err := services.GetCategories(userID)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, "Daftar kategori", categories)
}

// GetCategoryByID godoc
// @Summary Get category by ID
// @Description Mengambil detail kategori berdasarkan ID
// @Tags Categories
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/categories/{id} [get]
func GetCategoryByID(c *gin.Context) {

	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"ID kategori tidak valid",
		)
		return
	}

	userID := c.GetUint("user_id")

	category, err := services.GetCategoryByID(uint(id), userID)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Kategori tidak ditemukan",
		)
		return
	}

	response.Success(
		c,
		"Detail kategori berhasil diambil",
		category,
	)
}

// UpdateCategory godoc
// @Summary Update category
// @Description Mengubah kategori
// @Tags Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Param request body dto.UpdateCategoryRequest true "Update Category Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/categories/{id} [put]
func UpdateCategory(c *gin.Context) {

	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"ID kategori tidak valid",
		)
		return
	}

	var req dto.UpdateCategoryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	userID := c.GetUint("user_id")

	category, err := services.UpdateCategory(
		uint(id),
		userID,
		req,
	)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Kategori tidak ditemukan",
		)
		return
	}

	response.Success(
		c,
		"Kategori berhasil diperbarui",
		category,
	)
}

// DeleteCategory godoc
// @Summary Delete category
// @Description Menghapus kategori
// @Tags Categories
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/categories/{id} [delete]
func DeleteCategory(c *gin.Context) {

	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)

	if err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"ID kategori tidak valid",
		)
		return
	}

	userID := c.GetUint("user_id")

	err = services.DeleteCategory(uint(id), userID)

	if err != nil {
		response.Error(
			c,
			http.StatusNotFound,
			"Kategori tidak ditemukan",
		)
		return
	}

	response.Success(
		c,
		"Kategori berhasil dihapus",
		nil,
	)
}