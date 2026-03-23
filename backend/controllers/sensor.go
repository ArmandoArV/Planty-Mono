package controllers

import (
	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type sensorInput struct {
	Moisture  float64 `json:"moisture"`
	PumpOn    bool    `json:"pump_on"`
	PlantMood string  `json:"plant_mood"`
}

// CreateReading stores a new sensor data point for a plant.
func CreateReading(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	// Ensure plant belongs to user
	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	var input sensorInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	reading := models.SensorReading{
		PlantID:   plantID,
		Moisture:  input.Moisture,
		PumpOn:    input.PumpOn,
		PlantMood: input.PlantMood,
	}

	if err := config.DB.Create(&reading).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not save reading"})
	}

	return c.Status(fiber.StatusCreated).JSON(reading)
}

// ListReadings returns sensor readings for a plant (newest first, limit 100).
func ListReadings(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	// Verify ownership
	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	var readings []models.SensorReading
	config.DB.Where("plant_id = ?", plantID).Order("created_at desc").Limit(100).Find(&readings)
	return c.JSON(readings)
}

// LatestReading returns the most recent sensor reading for a plant.
func LatestReading(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	var reading models.SensorReading
	if err := config.DB.Where("plant_id = ?", plantID).Order("created_at desc").First(&reading).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No readings found"})
	}

	return c.JSON(reading)
}
