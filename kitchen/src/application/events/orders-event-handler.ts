import { EventHandler } from "@/services/interfaces/event-handler";
import { SQS } from "@aws-sdk/client-sqs";

const sqs = new SQS();

export class OrdersEventHandler implements EventHandler {
  public async receive({
    queue,
    callback,
  }: {
    queue: string;
    callback: (data: any) => void;
  }): Promise<void> {
    const params = {
      MessageAttributeNames: ["All"],
      QueueUrl: queue,
      VisibilityTimeout: 20,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    };
    try {
      const poll = async () => {
        console.log("Long poll started, waiting 20 seconds for messages... ");
        const result = await sqs.receiveMessage(params);
        console.log(
          "Long poll finalized, next poll will start in 10 seconds.",
          result
        );
        setTimeout(poll, 10000);
        const { Messages } = result;
        if (Messages) {
          console.log("Message received:", Messages[0]);
          const deleteParams = {
            QueueUrl: queue,
            ReceiptHandle: Messages[0].ReceiptHandle,
          };
          try {
            const result = await sqs.deleteMessage(deleteParams);
            console.log("Message deleted:", result);
          } catch (error) {
            console.log("Error deleting message", error);
          } finally {
            callback(Messages[0].Body);
          }
        }
      };

      poll();
    } catch (error) {
      console.log("Error receiving message", error);
    }
  }
  public async send({
    queue,
    data,
  }: {
    queue: string;
    data: any;
  }): Promise<void> {
    const params = {
      MessageBody: JSON.stringify(data),
      MessageGroupId: "Group1",
      QueueUrl: queue,
    };
    const result = await sqs.sendMessage(params);
    console.log("Message sent:", result);
  }
}
