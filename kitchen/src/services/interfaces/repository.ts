export interface Repository<T> {
  create({ item }: { item: T }): Promise<T>;
  update({
    userId,
    id,
    item,
  }: {
    userId: string;
    id: string;
    item: T;
  }): Promise<T>;
  findById({ userId, id }: { userId: string; id: string }): Promise<T | null>;
  findAll(filter?: Partial<Record<keyof T, any>>): Promise<T[]>;
  delete({ userId, id }: { userId: string; id: string }): Promise<void>;
}
