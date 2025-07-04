import { config } from "@/config";
import { EventHandler } from "@/services/interfaces/event-handler";

import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "kitchen-producer",
  brokers: [config.BROKER_URL || "localhost:9092"],
});

export class OrdersEventHandler implements EventHandler {
  public async receive({
    destination: topic,
    callback,
  }: {
    destination: string;
    callback: (data: any) => void;
  }): Promise<void> {
    const consumer = kafka.consumer({ groupId: "kitchen-group" });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Received message: ${message.value.toString()} from topic: ${topic}`
        );
        callback(message.value);
      },
    });
  }

  public async send({
    destination: topic,
    data,
  }: {
    destination: string;
    data: any;
  }): Promise<void> {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic,
      messages: [data],
    });

    await producer.disconnect();
  }
}
