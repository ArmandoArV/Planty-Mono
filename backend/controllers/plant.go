package controllers

import (
	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type plantInput struct {
	Name    string `json:"name"`
	Species string `json:"species"`
}

// ListPlants returns all plants for the authenticated user.
func ListPlants(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	var plants []models.Plant
	config.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&plants)
	return c.JSON(plants)
}

// GetPlant returns a single plant by ID (must belong to the user).
func GetPlant(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}
	return c.JSON(plant)
}

// CreatePlant adds a new plant for the authenticated user.
func CreatePlant(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))

	var input plantInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if input.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name is required"})
	}

	plant := models.Plant{
		UserID:  userID,
		Name:    input.Name,
		Species: input.Species,
	}

	if err := config.DB.Create(&plant).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create plant"})
	}

	return c.Status(fiber.StatusCreated).JSON(plant)
}

// UpdatePlant modifies an existing plant.
func UpdatePlant(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	var input plantInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if input.Name != "" {
		plant.Name = input.Name
	}
	if input.Species != "" {
		plant.Species = input.Species
	}

	config.DB.Save(&plant)
	return c.JSON(plant)
}

// DeletePlant soft-deletes a plant.
func DeletePlant(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	result := config.DB.Where("id = ? AND user_id = ?", plantID, userID).Delete(&models.Plant{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}
	return c.JSON(fiber.Map{"message": "Plant deleted"})
}

// TogglePump flips the pump_status boolean for a plant.
func TogglePump(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	plantID, err := uuid.Parse(c.Params("plantId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid plant ID"})
	}

	var plant models.Plant
	if err := config.DB.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Plant not found"})
	}

	plant.PumpStatus = !plant.PumpStatus
	config.DB.Save(&plant)
	return c.JSON(plant)
}
