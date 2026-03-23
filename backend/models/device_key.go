package models

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DeviceKey represents a static API key that an Arduino device uses
// to authenticate with the backend. Each key is bound to a specific plant.
type DeviceKey struct {
	ID      uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID  uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	PlantID uuid.UUID `gorm:"type:uuid;index;not null" json:"plant_id"`
	Key     string    `gorm:"size:64;uniqueIndex;not null" json:"key"`
	Label   string    `gorm:"size:120" json:"label"` // e.g. "Living Room Arduino"
	Active  bool      `gorm:"default:true" json:"active"`
}

func (d *DeviceKey) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	if d.Key == "" {
		d.Key = generateDeviceKey()
	}
	return nil
}

// generateDeviceKey creates a cryptographically random 32-byte hex string.
func generateDeviceKey() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		// Fallback to UUID-based key if crypto/rand fails
		return uuid.New().String() + uuid.New().String()
	}
	return hex.EncodeToString(b)
}
