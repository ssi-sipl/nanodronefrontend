import mqtt from "mqtt";

const {
  MQTT_BROKER_URL,
  MQTT_BROKER_PORT,
  MQTT_BROKER_USERNAME,
  MQTT_BROKER_PASSWORD,
  MQTT_BROKER_TOPIC,
} = process.env;

const options: mqtt.IClientOptions = {
  port: MQTT_BROKER_PORT ? parseInt(MQTT_BROKER_PORT) : undefined,
  username: MQTT_BROKER_USERNAME,
  password: MQTT_BROKER_PASSWORD,
};

// Store globally to ensure a single connection
let mqttClient: mqtt.MqttClient | null = (globalThis as any).mqttClient || null;
let isConnected = false;

export function getMqttClient(): mqtt.MqttClient {
  if (!mqttClient) {
    mqttClient = mqtt.connect(MQTT_BROKER_URL as string, options);

    mqttClient.on("connect", () => {
      if (!isConnected) {
        console.log("✅ Connected to MQTT broker");
        isConnected = true;
      }

      if (MQTT_BROKER_TOPIC) {
        mqttClient?.subscribe(MQTT_BROKER_TOPIC, (err) => {
          if (err) console.error("❌ MQTT subscribe error:", err);
          else console.log(`📡 Subscribed to topic: ${MQTT_BROKER_TOPIC}`);
        });
      }
    });

    mqttClient.on("message", (topic, message) => {
      console.log(`📩 MQTT [${topic}] ${message.toString()}`);
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT Error:", err.message);
    });

    // Persist the client globally so it's not re-created
    (globalThis as any).mqttClient = mqttClient;
  }

  return mqttClient;
}
