package controllers

import (
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
)

// HealthController handles requests to /health.
func HealthController(c *fiber.Ctx) error {
	return c.JSON(models.HealthResponse{Status: "ok"})
}
