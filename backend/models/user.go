package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a registered user.
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey"      json:"id"`
	Name         string         `gorm:"size:120;not null"          json:"name"`
	Email        string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"size:64;not null"           json:"-"` // SHA-256 hex digest
	RoleID       uuid.UUID      `gorm:"type:uuid;index;not null"   json:"role_id"`
	Role         Role           `gorm:"foreignKey:RoleID"          json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index"                     json:"-"`
	Plants       []Plant        `gorm:"foreignKey:UserID"         json:"plants,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
