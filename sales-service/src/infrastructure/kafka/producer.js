import { Kafka } from "kafkajs";

const brokerList = (process.env.KAFKA_BROKERS || "kafka:9092")
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "sales-service",
  brokers: brokerList,
  retry: {
    retries: 20,
    initialRetryTime: 300,
    factor: 2,
  },
});

const producer = kafka.producer();

export async function connectProducer({ retryDelayMs = 2000 } = {}) {
  // Retry loop so service doesn't crash if Kafka not ready yet
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await producer.connect();
      console.log("Kafka producer connected");
      break;
    } catch (err) {
      console.error(`Kafka producer connection failed, retrying in ${retryDelayMs}ms:`, err?.message || err);
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
}

export async function publishSaleEvent(sale) {
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC_SALES || "sales-events",
      messages: [
        {
          key: String(sale.id),
          value: JSON.stringify(sale),
        },
      ],
    });
    console.log(`📤 Sale event sent to Kafka: ${sale.id}`);
  } catch (e) {
    console.error("Failed to publish sale event", e);
  }
}
