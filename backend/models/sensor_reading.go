package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SensorReading stores a single data point from the Arduino.
type SensorReading struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PlantID   uuid.UUID `gorm:"type:uuid;index;not null" json:"plant_id"`
	Moisture  float64   `gorm:"not null"             json:"moisture"`   // 0-100 %
	PumpOn    bool      `json:"pump_on"`
	PlantMood string    `gorm:"size:10"              json:"plant_mood"` // happy | normal | sad
	CreatedAt time.Time `json:"created_at"`
}

func (s *SensorReading) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
