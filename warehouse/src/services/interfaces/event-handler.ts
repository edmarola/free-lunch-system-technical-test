export interface EventHandler {
  receive: ({
    destination,
    callback,
  }: {
    destination: string;
    callback: (data: any) => void;
  }) => Promise<void>;
  send: ({
    destination,
    data,
  }: {
    destination: string;
    data: any;
  }) => Promise<void>;
}
