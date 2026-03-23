package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Plant represents a single pot linked to a user.
type Plant struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     uuid.UUID      `gorm:"type:uuid;index;not null" json:"user_id"`
	Name       string         `gorm:"size:120;not null"    json:"name"`
	Species    string         `gorm:"size:120"             json:"species"`
	PumpStatus bool           `gorm:"default:false"        json:"pump_status"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index"                json:"-"`

	Readings []SensorReading `gorm:"foreignKey:PlantID" json:"readings,omitempty"`
}

func (p *Plant) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
