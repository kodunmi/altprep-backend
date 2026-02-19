import { BaseEntity } from 'typeorm';

export abstract class EntityBase extends BaseEntity {
  createdAt: string;
  updatedAt: string;
}
