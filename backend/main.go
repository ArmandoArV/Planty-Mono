package main

import (
	"log"
	"os"

	"github.com/ArmandoArV/Planty-Mono/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	// Logger middleware
	app.Use(logger.New())

	// CORS – allow origin from env var, default to localhost:3000 for dev
	allowOrigin := os.Getenv("CORS_ORIGIN")
	if allowOrigin == "" {
		allowOrigin = "http://localhost:3000"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins: allowOrigin,
	}))

	// Register all routes
	routes.Register(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend listening on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

