package controllers

import (
	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ListRoles returns all available roles.
func ListRoles(c *fiber.Ctx) error {
	var roles []models.Role
	config.DB.Order("description asc").Find(&roles)
	return c.JSON(roles)
}

// GetRole returns a single role by ID.
func GetRole(c *fiber.Ctx) error {
	roleID, err := uuid.Parse(c.Params("roleId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid role ID"})
	}

	var role models.Role
	if err := config.DB.First(&role, "id = ?", roleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Role not found"})
	}
	return c.JSON(role)
}

type roleInput struct {
	Description string `json:"description"`
}

// CreateRole adds a new role (admin only).
func CreateRole(c *fiber.Ctx) error {
	var input roleInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if input.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "description is required"})
	}

	role := models.Role{Description: input.Description}
	if err := config.DB.Create(&role).Error; err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Role already exists"})
	}
	return c.Status(fiber.StatusCreated).JSON(role)
}

// UpdateRole modifies a role's description (admin only).
func UpdateRole(c *fiber.Ctx) error {
	roleID, err := uuid.Parse(c.Params("roleId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid role ID"})
	}

	var role models.Role
	if err := config.DB.First(&role, "id = ?", roleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Role not found"})
	}

	var input roleInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if input.Description != "" {
		role.Description = input.Description
	}

	config.DB.Save(&role)
	return c.JSON(role)
}

// DeleteRole removes a role (admin only).
func DeleteRole(c *fiber.Ctx) error {
	roleID, err := uuid.Parse(c.Params("roleId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid role ID"})
	}

	result := config.DB.Delete(&models.Role{}, "id = ?", roleID)
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Role not found"})
	}
	return c.JSON(fiber.Map{"message": "Role deleted"})
}

// AssignRole changes a user's role (admin only).
func AssignRole(c *fiber.Ctx) error {
	targetUserID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var input struct {
		RoleID string `json:"role_id"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	roleID, err := uuid.Parse(input.RoleID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid role_id"})
	}

	// Verify role exists
	var role models.Role
	if err := config.DB.First(&role, "id = ?", roleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Role not found"})
	}

	var user models.User
	if err := config.DB.First(&user, "id = ?", targetUserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	user.RoleID = roleID
	config.DB.Save(&user)
	config.DB.Preload("Role").First(&user, "id = ?", user.ID)

	return c.JSON(user)
}
