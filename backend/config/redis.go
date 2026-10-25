package config

import (
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

var RedisContext = context.Background()

func ConnectRedis() {

	host := os.Getenv("REDIS_HOST")

	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")

	if port == "" {
		port = "6379"
	}

	db := 0

	if dbEnv := os.Getenv("REDIS_DB"); dbEnv != "" {
		parsedDB, err := strconv.Atoi(dbEnv)

		if err == nil {
			db = parsedDB
		}
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: host + ":" + port,
		DB:   db,
	})

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()

	if err != nil {
		log.Println("Redis connection failed:", err)
		return
	}

	log.Println("Redis connected successfully")
}