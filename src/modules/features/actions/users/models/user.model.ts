import { BaseModel, createBaseSchema } from '@nodesandbox/repo-framework';
import { IUserModel } from '../types';

const USER_MODEL_NAME = 'User';

const userSchema = createBaseSchema<IUserModel>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'guest'],
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    modelName: USER_MODEL_NAME,
  },
);

const UserModel = new BaseModel<IUserModel>(
  USER_MODEL_NAME,
  userSchema,
).getModel();

export { UserModel };
