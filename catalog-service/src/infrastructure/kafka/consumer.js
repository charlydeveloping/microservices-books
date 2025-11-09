import { Kafka } from "kafkajs";

// Allow configuring brokers via env var, defaulting to docker-compose service name
const brokerList = (process.env.KAFKA_BROKERS || "kafka:9092")
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "catalog-service",
  brokers: brokerList,
  // Be a bit more patient on startup; DNS may not be ready yet
  retry: {
    retries: 20,
    initialRetryTime: 300,
    factor: 2,
  },
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || "catalog-group" });

export async function startConsumer({ retryDelayMs = 2000 } = {}) {
  // Keep trying until Kafka is reachable; never crash the process on startup
  // This avoids ENOTFOUND or connection errors bringing the service down
  // when Kafka is still starting.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_SALES || "sales-events", fromBeginning: false });

      console.log("Kafka consumer connected - listening for sales-events");

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const sale = JSON.parse(message.value.toString());
            const { bookId, quantity } = sale;
            if (!global.bookRepository) {
              console.warn("Book repository not set yet; skipping stock decrement");
              return;
            }
            try {
              await global.bookRepository.decrementQuantity(bookId, quantity);
              console.log(`Stock decremented for book ${bookId} by ${quantity}`);
            } catch (stockErr) {
              console.error(`Failed to decrement stock for book ${bookId}`, stockErr.code || stockErr.message);
            }
          } catch (e) {
            console.error("Failed to process Kafka message", e);
          }
        },
      });

      // consumer.run keeps running; if it returns, break loop
      break;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.error(`Kafka consumer connection failed, will retry in ${retryDelayMs}ms:`, msg);
      try {
        await consumer.disconnect().catch(() => {});
      } catch (_) {
        // ignore
      }
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
}
