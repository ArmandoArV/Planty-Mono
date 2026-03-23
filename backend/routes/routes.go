package routes

import (
	"github.com/ArmandoArV/Planty-Mono/backend/controllers"
	"github.com/ArmandoArV/Planty-Mono/backend/middleware"
	"github.com/gofiber/fiber/v2"
)

// Register mounts all application routes onto the given Fiber app.
func Register(app *fiber.App) {
	api := app.Group("/api")

	// Public
	api.Get("/health", controllers.HealthController)
	api.Post("/auth/register", controllers.Register)
	api.Post("/auth/login", controllers.Login)

	// Device endpoints — authenticated via X-Device-Key header (for Arduino)
	device := api.Group("/device", middleware.DeviceKeyRequired())
	device.Post("/readings", controllers.DevicePostReading)
	device.Get("/pump", controllers.DeviceGetPumpStatus)

	// Protected — require Bearer token
	auth := api.Group("", middleware.AuthRequired())

	// User
	auth.Get("/user/profile", controllers.GetProfile)
	auth.Put("/user/profile", controllers.UpdateProfile)
	auth.Delete("/user/profile", controllers.DeleteProfile)

	// Plants
	auth.Get("/plants", controllers.ListPlants)
	auth.Post("/plants", controllers.CreatePlant)
	auth.Get("/plants/:plantId", controllers.GetPlant)
	auth.Put("/plants/:plantId", controllers.UpdatePlant)
	auth.Delete("/plants/:plantId", controllers.DeletePlant)
	auth.Patch("/plants/:plantId/pump", controllers.TogglePump)

	// Sensor readings
	auth.Post("/plants/:plantId/readings", controllers.CreateReading)
	auth.Get("/plants/:plantId/readings", controllers.ListReadings)
	auth.Get("/plants/:plantId/readings/latest", controllers.LatestReading)

	// Device keys management
	auth.Get("/device-keys", controllers.ListDeviceKeys)
	auth.Post("/device-keys", controllers.CreateDeviceKey)
	auth.Delete("/device-keys/:keyId", controllers.RevokeDeviceKey)

	// Roles — list/get available to any authenticated user
	auth.Get("/roles", controllers.ListRoles)
	auth.Get("/roles/:roleId", controllers.GetRole)

	// Roles — admin-only management
	admin := auth.Group("", middleware.RoleRequired("admin"))
	admin.Post("/roles", controllers.CreateRole)
	admin.Put("/roles/:roleId", controllers.UpdateRole)
	admin.Delete("/roles/:roleId", controllers.DeleteRole)
	admin.Patch("/users/:userId/role", controllers.AssignRole)
}
