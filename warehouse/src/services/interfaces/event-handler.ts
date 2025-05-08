export interface EventHandler {
  receive: ({
    queue,
    callback,
  }: {
    queue: string;
    callback: (data: any) => void;
  }) => Promise<void>;
  send: ({ queue, data }: { queue: string; data: any }) => Promise<void>;
}
