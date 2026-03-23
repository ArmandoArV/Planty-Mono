package controllers

import (
	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type deviceKeyInput struct {
	PlantID string `json:"plant_id"`
	Label   string `json:"label"`
}

// CreateDeviceKey generates a new API key for an Arduino device.
// Requires JWT auth — the plant must belong to the authenticated user.
func CreateDeviceKey(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))

	var input deviceKeyInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	plantID, err := uuid.Parse(input.PlantID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant_id"})
	}

	// Verify plant ownership
	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	dk := models.DeviceKey{
		UserID:  userID,
		PlantID: plantID,
		Label:   input.Label,
		Active:  true,
	}

	if err := config.DB.Create(&dk).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create device key"})
	}

	return c.Status(fiber.StatusCreated).JSON(dk)
}

// ListDeviceKeys returns all device keys for the authenticated user.
func ListDeviceKeys(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))

	var keys []models.DeviceKey
	config.DB.Where("user_id = ?", userID).Order("plant_id").Find(&keys)
	return c.JSON(keys)
}

// RevokeDeviceKey deactivates a device key.
func RevokeDeviceKey(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	keyID, err := uuid.Parse(c.Params("keyId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid key ID"})
	}

	var dk models.DeviceKey
	if err := config.DB.Where("id = ? AND user_id = ?", keyID, userID).First(&dk).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Device key not found"})
	}

	dk.Active = false
	config.DB.Save(&dk)
	return c.JSON(fiber.Map{"message": "Device key revoked"})
}

// DevicePostReading receives sensor data from an Arduino device.
// Authenticated via X-Device-Key header (not JWT).
// The plant_id comes from the device key record, not from the URL.
func DevicePostReading(c *fiber.Ctx) error {
	plantIDStr, _ := c.Locals("plant_id").(string)
	plantID, _ := uuid.Parse(plantIDStr)

	var input sensorInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Auto-derive mood from moisture if not provided
	if input.PlantMood == "" {
		switch {
		case input.Moisture >= 66.66:
			input.PlantMood = "happy"
		case input.Moisture >= 33.33:
			input.PlantMood = "normal"
		default:
			input.PlantMood = "sad"
		}
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

// DeviceGetPumpStatus lets the Arduino poll pump_status for its linked plant.
// Authenticated via X-Device-Key header.
func DeviceGetPumpStatus(c *fiber.Ctx) error {
	plantIDStr, _ := c.Locals("plant_id").(string)
	plantID, _ := uuid.Parse(plantIDStr)

	var plant models.Plant
	if err := config.DB.Where("id = ?", plantID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	return c.JSON(fiber.Map{
		"plant_id":    plant.ID,
		"pump_status": plant.PumpStatus,
		"name":        plant.Name,
	})
}
