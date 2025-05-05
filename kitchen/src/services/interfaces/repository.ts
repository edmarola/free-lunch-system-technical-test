export interface Repository<T> {
  create(item: T): Promise<T>;
  update(id: string, item: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<Record<keyof T, any>>): Promise<T[]>;
  delete(id: string): Promise<void>;
}
