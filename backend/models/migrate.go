package models

import (
	"github.com/ArmandoArV/Planty-Mono/backend/config"
)

// Migrate auto-migrates all models to the database and seeds default roles.
func Migrate() {
	config.DB.AutoMigrate(&Role{}, &User{}, &Plant{}, &SensorReading{}, &DeviceKey{})
	SeedRoles(config.DB)
}
