package routes

import (
	"github.com/ArmandoArV/Planty-Mono/backend/controllers"
	"github.com/gofiber/fiber/v2"
)

// Register mounts all application routes onto the given Fiber app.
func Register(app *fiber.App) {
	api := app.Group("/api")
	api.Get("/health", controllers.HealthController)
}
