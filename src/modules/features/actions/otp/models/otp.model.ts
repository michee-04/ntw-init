import { BaseModel, createBaseSchema } from '@nodesandbox/repo-framework';
import { Schema } from 'mongoose';
import { IOtpModel } from '../types';
import { attemptLimitingPlugin } from './_plugins';

const OTP_MODEL_NAME = 'Otp';

const otpSchema = createBaseSchema<IOtpModel>(
  {
    code: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    isFresh: {
      type: Boolean,
      default: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.keys(CONFIG.otp.purposes),
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    excludePlugins: ['sortDelete'],
    includePlugins: [[attemptLimitingPlugin, { maxAttempts: 5 }]],
    modelName: OTP_MODEL_NAME,
  },
);

const OtpModel = new BaseModel<IOtpModel>(OTP_MODEL_NAME, otpSchema).getModel();

export { OtpModel };
