package controllers

import (
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/middleware"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type registerInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // "admin" | "user" | "viewer" — defaults to "user"
}

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func hashPassword(password string) string {
	h := sha256.Sum256([]byte(password))
	return fmt.Sprintf("%x", h)
}

func generateToken(userID string, roleDesc string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    roleDesc,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(middleware.JWTSecret())
}

// Register creates a new user account.
func Register(c *fiber.Ctx) error {
	var input registerInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if input.Name == "" || input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name, email, and password are required"})
	}

	// Check for existing user
	var existing models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already registered"})
	}

	// Resolve role (default to "user")
	roleName := input.Role
	if roleName == "" {
		roleName = "user"
	}
	var role models.Role
	if err := config.DB.Where("description = ?", roleName).First(&role).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid role: " + roleName})
	}

	user := models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: hashPassword(input.Password),
		RoleID:       role.ID,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create user"})
	}

	// Reload with role association
	config.DB.Preload("Role").First(&user, "id = ?", user.ID)

	token, err := generateToken(user.ID.String(), role.Description)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not generate token"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":  user,
		"token": token,
	})
}

// Login authenticates a user and returns a JWT.
func Login(c *fiber.Ctx) error {
	var input loginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email and password are required"})
	}

	var user models.User
	if err := config.DB.Preload("Role").Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if user.PasswordHash != hashPassword(input.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, err := generateToken(user.ID.String(), user.Role.Description)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not generate token"})
	}

	return c.JSON(fiber.Map{
		"user":  user,
		"token": token,
	})
}
