# Build stage
FROM golang:1.26-alpine as build

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Create migrations directory if it doesn't exist
RUN mkdir -p migrations

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd

# Production stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary
COPY --from=build /app/main .
COPY --from=build /app/migrations ./migrations

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]
