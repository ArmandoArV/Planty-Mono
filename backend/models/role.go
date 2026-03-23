package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role represents a user type / permission level.
type Role struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Description string    `gorm:"size:60;uniqueIndex;not null" json:"description"`
}

func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// DefaultRoles are seeded on first migration.
var DefaultRoles = []Role{
	{Description: "admin"},
	{Description: "user"},
	{Description: "viewer"},
}

// SeedRoles inserts default roles if they don't exist yet.
func SeedRoles(db *gorm.DB) {
	for _, r := range DefaultRoles {
		var existing Role
		if db.Where("description = ?", r.Description).First(&existing).Error != nil {
			db.Create(&r)
		}
	}
}
