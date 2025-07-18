import { EventHandler } from "@/services/interfaces/event-handler";
import { SQS } from "@aws-sdk/client-sqs";

const sqs = new SQS();

export class OrdersEventHandler implements EventHandler {
  public async receive({
    destination,
    callback,
  }: {
    destination: string;
    callback: (data: any) => void;
  }): Promise<void> {
    const params = {
      MessageAttributeNames: ["All"],
      QueueUrl: destination,
      VisibilityTimeout: 20,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    };
    try {
      const poll = async () => {
        console.log("Long poll started, waiting 20 seconds for messages... ");
        const result = await sqs.receiveMessage(params);
        console.log("Long poll finalized, next poll will start in 10 seconds.");
        setTimeout(poll, 10000);
        const { Messages } = result;
        if (Messages) {
          console.log("Message received:", Messages[0]);
          const deleteParams = {
            QueueUrl: destination,
            ReceiptHandle: Messages[0].ReceiptHandle,
          };
          try {
            await sqs.deleteMessage(deleteParams);
          } catch (error) {
            console.error("Error deleting message", error);
          } finally {
            callback(Messages[0].Body);
          }
        }
      };

      poll();
    } catch (error) {
      console.error("Error receiving message", error);
    }
  }
  public async send({
    destination,
    data,
  }: {
    destination: string;
    data: any;
  }): Promise<void> {
    const params = {
      MessageBody: JSON.stringify(data),
      MessageGroupId: "Group1",
      QueueUrl: destination,
    };
    const result = await sqs.sendMessage(params);
    console.log("Message sent:", result);
  }
}
