package utils

import (
	"context"
	"strconv"

	"expense-tracker-api/config"
)

func InvalidateDashboardCache(userID uint) {

	if config.RedisClient == nil {
		return
	}

	cacheKey := "dashboard:summary:user:" +
		strconv.FormatUint(uint64(userID), 10)

	err := config.RedisClient.
		Del(context.Background(), cacheKey).
		Err()

	if err != nil {
		println("Gagal menghapus dashboard cache")
		return
	}

	println("Dashboard cache INVALIDATED")
}
