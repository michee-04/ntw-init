import { BaseRepository } from '@nodesandbox/repo-framework';
import { Model } from 'mongoose';
import { IUserModel } from '../types';

export class UserRepository extends BaseRepository<IUserModel> {
  constructor(model: Model<IUserModel>) {
    super(model);
  }

  async findByRole(role: string): Promise<IUserModel[]> {
    return this.model.find({ role }).exec();
  }
}
