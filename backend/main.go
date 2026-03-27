package main

import (
	"log"
	"os"

	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/ArmandoArV/Planty-Mono/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if present
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Database
	config.ConnectDB()
	models.Migrate()

	app := fiber.New()

	// Logger middleware
	app.Use(logger.New())

	// CORS – allow origin from env var, default to localhost:3000 for dev
	allowOrigin := os.Getenv("CORS_ORIGIN")
	if allowOrigin == "" {
		allowOrigin = "https://planty-frontend.vercel.app"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:  allowOrigin,
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		AllowMethods:  "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		ExposeHeaders: "Content-Length",
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

