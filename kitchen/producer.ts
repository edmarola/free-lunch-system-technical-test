import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "kitchen-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

(async () => {
  await producer.connect();
  await producer.send({
    topic: "kitchen-orders",
    messages: [
      { key: "order1", value: "Order details for order 1" },
      { key: "order2", value: "Order details for order 2" },
    ],
  });

  await producer.disconnect();
})();
