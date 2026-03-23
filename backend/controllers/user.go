package controllers

import (
	"crypto/sha256"
	"fmt"

	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetProfile returns the authenticated user's profile.
func GetProfile(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	var user models.User
	if err := config.DB.Preload("Role").First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}

type updateUserInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UpdateProfile updates the authenticated user's profile.
func UpdateProfile(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))

	var user models.User
	if err := config.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	var input updateUserInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Password != "" {
		h := sha256.Sum256([]byte(input.Password))
		user.PasswordHash = fmt.Sprintf("%x", h)
	}

	config.DB.Save(&user)
	return c.JSON(user)
}

// DeleteProfile soft-deletes the authenticated user.
func DeleteProfile(c *fiber.Ctx) error {
	userID, _ := uuid.Parse(c.Locals("user_id").(string))
	if err := config.DB.Delete(&models.User{}, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not delete user"})
	}
	return c.JSON(fiber.Map{"message": "User deleted"})
}
