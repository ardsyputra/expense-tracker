# =========================
# BUILD STAGE
# =========================
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install git untuk dependency tertentu
RUN apk add --no-cache git

# Copy dependency files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy seluruh source code
COPY . .

# Build aplikasi
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o expense-tracker-api .

# =========================
# RUN STAGE
# =========================
FROM alpine:latest

WORKDIR /app

# Sertifikat HTTPS
RUN apk add --no-cache ca-certificates

# Copy binary dari builder
COPY --from=builder /app/expense-tracker-api .

# Copy Swagger docs jika diperlukan
COPY --from=builder /app/docs ./docs

# Port aplikasi
EXPOSE 8080

# Jalankan aplikasi
CMD ["./expense-tracker-api"]