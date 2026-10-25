package services

import (
	"context"
	"encoding/json"
	"strconv"
	"time"

	"expense-tracker-api/config"
	"expense-tracker-api/dto"
	"expense-tracker-api/repositories"
)

type DashboardService struct {
	Repository *repositories.DashboardRepository
}

func NewDashboardService(
	repository *repositories.DashboardRepository,
) *DashboardService {
	return &DashboardService{
		Repository: repository,
	}
}

func (s *DashboardService) GetSummary(
	userID uint,
) (*dto.DashboardSummaryResponse, error) {

	ctx := context.Background()

	// =========================
	// REDIS CACHE KEY
	// =========================

	cacheKey := "dashboard:summary:user:" +
		strconv.FormatUint(uint64(userID), 10)

	// =========================
	// CHECK REDIS
	// =========================

	if config.RedisClient != nil {

		cachedData, err := config.RedisClient.
			Get(ctx, cacheKey).
			Result()

		if err == nil {

			var summary dto.DashboardSummaryResponse

			err := json.Unmarshal(
				[]byte(cachedData),
				&summary,
			)

			if err == nil {
				println("Dashboard cache HIT")

				return &summary, nil
			}
		}
	}

	// =========================
	// CACHE MISS
	// =========================

	println("Dashboard cache MISS")

	// =========================
	// GET DATA FROM DATABASE
	// =========================

	totalIncome, err :=
		s.Repository.GetTotalIncome(userID)

	if err != nil {
		return nil, err
	}

	totalExpense, err :=
		s.Repository.GetTotalExpense(userID)

	if err != nil {
		return nil, err
	}

	balance := totalIncome - totalExpense

	summary := &dto.DashboardSummaryResponse{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		Balance:      balance,
	}

	// =========================
	// SAVE TO REDIS
	// =========================

	if config.RedisClient != nil {

		data, err := json.Marshal(summary)

		if err == nil {

			err = config.RedisClient.Set(
				ctx,
				cacheKey,
				data,
				5*time.Minute,
			).Err()

			if err == nil {
				println("Dashboard cache SAVED")
			}
		}
	}

	return summary, nil
}