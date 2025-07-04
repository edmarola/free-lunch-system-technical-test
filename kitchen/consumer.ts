import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "kitchen-producer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "kitchen-group" });
(async function () {
  await consumer.connect();
  await consumer.subscribe({ topic: "kitchen-orders", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `Received message: ${message.value.toString()} from topic: ${topic}`
      );
      // Process the message here
    },
  });
})();
