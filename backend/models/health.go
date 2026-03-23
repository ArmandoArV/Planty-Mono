package models

// HealthResponse represents the response body for the health endpoint.
type HealthResponse struct {
	Status string `json:"status"`
}
