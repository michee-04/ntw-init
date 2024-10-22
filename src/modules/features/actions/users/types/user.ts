import { IBaseModel } from '@nodesandbox/repo-framework';
import { Document } from 'mongoose';

export type IUserRole = 'user' | 'admin' | 'guest';

export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: IUserRole;
  verified: boolean;
}

export interface IUserModel extends IUser, IBaseModel, Document {}
