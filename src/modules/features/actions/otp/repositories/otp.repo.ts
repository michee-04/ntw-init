import { generateRandomCode } from 'helpers';
import { EntityCoreModule } from 'modules/entity-core';
import { Model } from 'mongoose';
import { IOtpModel, TOTPPurpose } from '../types';

const { BaseRepository } = EntityCoreModule.getChildren();

class OtpRepository extends BaseRepository<IOtpModel> {
  constructor(model: Model<IOtpModel>) {
    super(model);
  }

  async generateCode(
    user: string | any, // TODO: replace this later by a proper type (string|ObjectId)
    purpose: TOTPPurpose,
  ): Promise<IOtpModel> {
    await this.invalidateOldCodes(user, purpose);
    const payload = {
      code: generateRandomCode(CONFIG.otp.length),
      expiresAt: new Date(Date.now() + CONFIG.otp.expiration),
      user,
      purpose,
    };
    return this.create(payload);
  }

  async markAsUsed(otpId: string): Promise<IOtpModel | null> {
    const payload = { used: true };
    return this.update({ _id: otpId }, payload);
  }

  async isValid(code: string): Promise<boolean> {
    const otp = await this.findOne({ code, isFresh: true, used: false });
    return otp ? Date.now() <= otp.expiresAt.getTime() : false;
  }

  async findValidCodeByUser(
    code: string,
    user: string,
    purpose: TOTPPurpose,
  ): Promise<IOtpModel | null> {
    return await this.findOne({
      code,
      user,
      isFresh: true,
      used: false,
      purpose,
    });
  }

  async invalidateOldCodes(user: string, purpose: TOTPPurpose): Promise<void> {
    // TODO: Create a updateMany method or adapt the current update to be able to use it here instead of calling the model
    await this.model
      .updateMany({ user, used: false, purpose }, { $set: { isFresh: false } })
      .exec();
  }
}

export default OtpRepository;
