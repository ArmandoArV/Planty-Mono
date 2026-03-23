package middleware

import (
	"os"
	"strings"

	"github.com/ArmandoArV/Planty-Mono/backend/config"
	"github.com/ArmandoArV/Planty-Mono/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWTSecret returns the signing key (falls back to a dev default).
func JWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "planty-dev-secret-change-me"
	}
	return []byte(secret)
}

// AuthRequired is a Fiber middleware that validates a Bearer JWT token
// and injects the user_id claim into c.Locals("user_id").
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing Authorization header"})
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Authorization format"})
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Unexpected signing method")
			}
			return JWTSecret(), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		userID, ok := claims["user_id"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing user_id in token"})
		}

		c.Locals("user_id", userID)

		if role, ok := claims["role"].(string); ok {
			c.Locals("role", role)
		}

		return c.Next()
	}
}

// RoleRequired restricts access to users whose JWT role claim matches
// one of the allowed roles.
func RoleRequired(allowed ...string) fiber.Handler {
	set := make(map[string]struct{}, len(allowed))
	for _, a := range allowed {
		set[a] = struct{}{}
	}
	return func(c *fiber.Ctx) error {
		role, _ := c.Locals("role").(string)
		if _, ok := set[role]; !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Insufficient permissions"})
		}
		return c.Next()
	}
}

// DeviceKeyRequired authenticates requests using a static API key
// sent via the X-Device-Key header. Used by Arduino devices.
// Injects user_id and plant_id into c.Locals.
func DeviceKeyRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		key := c.Get("X-Device-Key")
		if key == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing X-Device-Key header"})
		}

		var dk models.DeviceKey
		if err := config.DB.Where("key = ? AND active = ?", key, true).First(&dk).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or inactive device key"})
		}

		c.Locals("user_id", dk.UserID.String())
		c.Locals("plant_id", dk.PlantID.String())
		c.Locals("device_key_id", dk.ID.String())

		return c.Next()
	}
}
