#include <WiFi.h>
#include <PubSubClient.h>

// 🔧 Configuración WiFi
const char* ssid = "UA-Alumnos";
const char* password = "41umn05WLC";

// 🔧 Configuración MQTT
const char* mqtt_server = "100.28.15.22";
const int mqtt_port = 1883;

// Configuración del tren
const int trainId = 1;
const int railcarNumber = 1;

// Cantidad de asientos a manejar
const int numSeats = 6;

// Pines de sensores y LEDs (ajustá a tu wiring real)
const int irSensorPins[numSeats] = {13, 25, 33, 32, 34, 35};
const int ledReservePins[numSeats] = { 21,16 ,17, 22, 27 , 26};

// Topics MQTT
char statusTopics[numSeats][50];
char reserveTopics[numSeats][50];

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  for (int i = 0; i < numSeats; i++) {
    if (String(topic) == String(reserveTopics[i])) {
      digitalWrite(ledReservePins[i], message == "true" ? HIGH : LOW);
      Serial.printf("💡 Seat %d → Reserve LED %s\n", i + 1, message == "true" ? "ON" : "OFF");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "ESP32-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("MQTT connected");
      for (int i = 0; i < numSeats; i++) {
        client.subscribe(reserveTopics[i]);
        Serial.printf("Subscribed to %s\n", reserveTopics[i]);
      }
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5s...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Inicializar pines
  for (int i = 0; i < numSeats; i++) {
    pinMode(irSensorPins[i], INPUT);
    pinMode(ledReservePins[i], OUTPUT);

    // Generar topics
    int seatNumber = i + 1;
    sprintf(statusTopics[i], "train/%d/seat/%d-%d/status", trainId, railcarNumber, seatNumber);
    sprintf(reserveTopics[i], "train/%d/seat/%d-%d/reserve", trainId, railcarNumber, seatNumber);
  }

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Publicar estado de cada sensor cada 5 segundos
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 1000) {
    for (int i = 0; i < numSeats; i++) {
      bool isOccupied = digitalRead(irSensorPins[i]) == LOW;
      const char* payload = isOccupied ? "1" : "0";
      client.publish(statusTopics[i], payload);
      Serial.printf("Seat %d → %s: %s\n", i + 1, statusTopics[i], payload);
    }
    Serial.println("__________________________________");
    lastPublish = millis();
  }
}