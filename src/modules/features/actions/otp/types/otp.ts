import { Document, Types } from 'mongoose';
import { IBaseModel } from 'types';

export type TOTPPurpose = keyof typeof CONFIG.otp.purposes;

export interface IOtp {
  code: string;
  user: Types.ObjectId;
  used: boolean;
  isFresh: boolean;
  expireAt: Date;
  purpose: TOTPPurpose;
  attempts?: number;
}

export interface IOtpModel extends IOtp, IBaseModel, Document {}
