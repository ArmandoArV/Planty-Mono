/************************************************************
 *  Planty — Arduino R4 WiFi Direct Backend Integration
 *
 *  This sketch replaces the Blynk dependency with direct
 *  HTTP calls to the Planty Go backend.
 *
 *  Hardware:
 *    - Arduino UNO R4 WiFi
 *    - Capacitive soil moisture sensor on A0
 *    - 5V relay module on D7 (controls water pump)
 *    - Built-in 12×8 LED matrix for plant mood display
 *
 *  Flow:
 *    1. Connect to WiFi
 *    2. Every READING_INTERVAL ms → read moisture → POST /api/device/readings
 *    3. Every PUMP_POLL_INTERVAL ms → GET /api/device/pump → set relay
 *    4. LED matrix shows happy/normal/sad based on moisture
 ************************************************************/

#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include "Arduino_LED_Matrix.h"
#include <EEPROM.h>

// ─── Configuration ───────────────────────────────────────
// WiFi
const char WIFI_SSID[]     = "YOUR_WIFI_SSID";
const char WIFI_PASS[]     = "YOUR_WIFI_PASSWORD";

// Backend server
const char SERVER_HOST[]   = "192.168.1.100";  // Your Go backend IP
const int  SERVER_PORT     = 3000;              // Fiber default port

// Device API key — generated via POST /api/device-keys from the web app
const char DEVICE_KEY[]    = "YOUR_DEVICE_KEY_HERE";

// Timing (milliseconds)
const unsigned long READING_INTERVAL   = 10000;  // Send reading every 10s
const unsigned long PUMP_POLL_INTERVAL = 5000;   // Poll pump status every 5s
const unsigned long WIFI_RETRY_DELAY   = 5000;   // Retry WiFi every 5s

// ─── Hardware pins ───────────────────────────────────────
#define MOISTURE_PIN A0
#define RELAY_PIN    7

// ─── LED Matrix frames ──────────────────────────────────
const uint32_t HAPPY_LED[] = {
    0x3fc48a95,
    0x58019fd9,
    0x5889871
};

const uint32_t NORMAL_LED[] = {
    0x3fc40298,
    0xd98d8019,
    0x5889871
};

const uint32_t SAD_LED[] = {
    0x3fc48a9d,
    0xd8898018,
    0x71889905
};

// ─── State ───────────────────────────────────────────────
ArduinoLEDMatrix matrix;
WiFiClient       wifi;
HttpClient       http(wifi, SERVER_HOST, SERVER_PORT);

unsigned long lastReadingTime = 0;
unsigned long lastPumpPollTime = 0;
bool          pumpStatus = false;
float         moisturePercent = 0.0;
String        currentMood = "normal";
int           consecutiveFailures = 0;
const int     MAX_FAILURES = 10;

// ─── EEPROM for pump state persistence ───────────────────
#define EEPROM_PUMP_ADDR 0

// ─── Forward declarations ────────────────────────────────
void connectWiFi();
void readMoisture();
void updateLedMatrix();
void postReading();
void pollPumpStatus();
void setPump(bool on);

// ═══════════════════════════════════════════════════════════
void setup() {
    Serial.begin(9600);
    while (!Serial && millis() < 3000); // Wait up to 3s for serial

    Serial.println(F("=== Planty Device Starting ==="));

    // Initialize hardware
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(MOISTURE_PIN, INPUT);
    analogReadResolution(12);
    matrix.begin();
    matrix.loadFrame(NORMAL_LED);

    // Restore pump state from EEPROM
    pumpStatus = EEPROM.read(EEPROM_PUMP_ADDR) == 1;
    setPump(pumpStatus);

    // Connect to WiFi
    connectWiFi();

    Serial.println(F("=== Setup Complete ==="));
}

// ═══════════════════════════════════════════════════════════
void loop() {
    // Ensure WiFi is connected
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println(F("[WiFi] Connection lost, reconnecting..."));
        connectWiFi();
    }

    unsigned long now = millis();

    // Read moisture continuously for LED feedback
    readMoisture();
    updateLedMatrix();

    // POST sensor reading at interval
    if (now - lastReadingTime >= READING_INTERVAL) {
        lastReadingTime = now;
        postReading();
    }

    // Poll pump status at interval
    if (now - lastPumpPollTime >= PUMP_POLL_INTERVAL) {
        lastPumpPollTime = now;
        pollPumpStatus();
    }

    // Apply pump state
    setPump(pumpStatus);

    delay(500);
}

// ─── WiFi Connection ─────────────────────────────────────
void connectWiFi() {
    Serial.print(F("[WiFi] Connecting to "));
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASS);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print(F("[WiFi] Connected! IP: "));
        Serial.println(WiFi.localIP());
        consecutiveFailures = 0;
    } else {
        Serial.println(F("\n[WiFi] Failed to connect. Will retry..."));
    }
}

// ─── Moisture Reading ────────────────────────────────────
void readMoisture() {
    int raw = analogRead(MOISTURE_PIN);
    moisturePercent = 100.0 - ((float)raw / 4096.0) * 100.0;

    // Clamp to valid range
    if (moisturePercent < 0) moisturePercent = 0;
    if (moisturePercent > 100) moisturePercent = 100;

    // Derive mood
    if (moisturePercent >= 66.66) {
        currentMood = "happy";
    } else if (moisturePercent >= 33.33) {
        currentMood = "normal";
    } else {
        currentMood = "sad";
    }
}

// ─── LED Matrix ──────────────────────────────────────────
void updateLedMatrix() {
    if (currentMood == "happy") {
        matrix.loadFrame(HAPPY_LED);
    } else if (currentMood == "normal") {
        matrix.loadFrame(NORMAL_LED);
    } else {
        matrix.loadFrame(SAD_LED);
    }
}

// ─── POST /api/device/readings ───────────────────────────
void postReading() {
    if (WiFi.status() != WL_CONNECTED) return;

    Serial.print(F("[POST] Moisture: "));
    Serial.print(moisturePercent, 1);
    Serial.print(F("% | Mood: "));
    Serial.print(currentMood);
    Serial.print(F(" | Pump: "));
    Serial.println(pumpStatus ? "ON" : "OFF");

    // Build JSON body
    JsonDocument doc;
    doc["moisture"] = moisturePercent;
    doc["pump_on"] = pumpStatus;
    doc["plant_mood"] = currentMood;

    String body;
    serializeJson(doc, body);

    // Send request
    http.beginRequest();
    http.post("/api/device/readings");
    http.sendHeader("Content-Type", "application/json");
    http.sendHeader("X-Device-Key", DEVICE_KEY);
    http.sendHeader("Content-Length", body.length());
    http.beginBody();
    http.print(body);
    http.endRequest();

    int status = http.responseStatusCode();
    String response = http.responseBody();

    if (status == 201) {
        Serial.println(F("[POST] Reading saved successfully"));
        consecutiveFailures = 0;
    } else {
        Serial.print(F("[POST] Failed with status: "));
        Serial.println(status);
        Serial.println(response);
        consecutiveFailures++;
    }

    if (consecutiveFailures >= MAX_FAILURES) {
        Serial.println(F("[ERROR] Too many failures, restarting WiFi..."));
        WiFi.disconnect();
        delay(1000);
        connectWiFi();
        consecutiveFailures = 0;
    }
}

// ─── GET /api/device/pump ────────────────────────────────
void pollPumpStatus() {
    if (WiFi.status() != WL_CONNECTED) return;

    http.beginRequest();
    http.get("/api/device/pump");
    http.sendHeader("X-Device-Key", DEVICE_KEY);
    http.endRequest();

    int status = http.responseStatusCode();
    String response = http.responseBody();

    if (status == 200) {
        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, response);
        if (!err) {
            bool newPumpStatus = doc["pump_status"].as<bool>();
            if (newPumpStatus != pumpStatus) {
                Serial.print(F("[PUMP] Status changed: "));
                Serial.println(newPumpStatus ? "ON" : "OFF");
                pumpStatus = newPumpStatus;
                EEPROM.write(EEPROM_PUMP_ADDR, pumpStatus ? 1 : 0);
            }
        }
    } else {
        Serial.print(F("[PUMP] Poll failed with status: "));
        Serial.println(status);
    }
}

// ─── Relay Control ───────────────────────────────────────
void setPump(bool on) {
    digitalWrite(RELAY_PIN, on ? HIGH : LOW);
}
