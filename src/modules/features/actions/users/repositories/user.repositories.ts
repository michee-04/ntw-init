import { EntityCoreModule } from 'modules/entity-core';
import { Model } from 'mongoose';
import { IUserModel } from '../types';

const { BaseRepository } = EntityCoreModule.getChildren();

export class UserRepository extends BaseRepository<IUserModel> {
  constructor(model: Model<IUserModel>) {
    super(model);
  }

  async findByRole(role: string): Promise<IUserModel[]> {
    return this.model.find({ role }).exec();
  }
}
