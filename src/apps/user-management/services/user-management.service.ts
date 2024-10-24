/* eslint-disable prettier/prettier */
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { AuthenticationStrategies } from 'modules/authz/authentication/strategies';
import { IOtpModel } from 'modules/features/actions/otp';
import otpService from 'modules/features/actions/otp/services/otp.service';
import { IUserModel } from 'modules/features/actions/users';
import userService from 'modules/features/actions/users/services/user.service';
import { Notificator } from 'modules/shared/notificator';

class UserManagementService {
  async register(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, phone } = payload;
      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (userResponse.success && userResponse.document) {
        throw new ErrorResponse(
          'UNIQUE_FIELD_ERROR',
          'The entered email is already registered.',
        );
      }

      const createUserResponse = (await userService.create(
        payload,
      )) as SuccessResponseType<IUserModel>;

      if (!createUserResponse.success || !createUserResponse.document) {
        throw createUserResponse.error;
      }

      await Notificator.sms.sendAccountCreationEmail({
        to: phone,
      });

      // await Notificator.mail.sendAccountCreationEmail({
      //   to: email,
      //   firstname: createUserResponse.document.firstname,
      // });

      const otpResponse = (await otpService.generate(
        email,
        CONFIG.otp.purposes.ACCOUNT_VERIFICATION.code,
      )) as SuccessResponseType<IOtpModel>;

      if (!otpResponse.success || !otpResponse.document) {
        throw otpResponse.error;
      }

      return {
        success: true,
        document: {
          user: createUserResponse.document,
          otp: otpResponse.document,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      if (userResponse.document.verified) {
        return { success: true }; // If already verified, return success without further actions
      }

      const validateOtpResponse = await otpService.validate(
        email,
        code,
        CONFIG.otp.purposes.ACCOUNT_VERIFICATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const verifyUserResponse = await userService.markAsVerified(email);

      if (!verifyUserResponse.success) {
        throw verifyUserResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async generateLoginOtp(
    email: string,
  ): Promise<SuccessResponseType<IOtpModel> | ErrorResponseType> {
    try {
      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await otpService.generate(
        email,
        CONFIG.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      return otpResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async loginWithPassword(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, password } = payload;
      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;
      const isValidPasswordResponse = (await userService.isvalidPassword(
        user.id,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;

      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const accessToken = await AuthenticationStrategies.jwt.signAccessToken(
        user.id,
      );
      const refreshToken = await AuthenticationStrategies.jwt.signRefreshToken(
        user.id,
      );

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async loginWithOtp(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;

      const validateOtpResponse = await otpService.validate(
        email,
        code,
        CONFIG.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const accessToken = await AuthenticationStrategies.jwt.signAccessToken(
        user.id,
      );
      const refreshToken = await AuthenticationStrategies.jwt.signRefreshToken(
        user.id,
      );

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async refresh(
    refreshToken: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      if (!refreshToken) {
        throw new ErrorResponse('BAD_REQUEST', 'Refresh token is required.');
      }

      const userId =
        await AuthenticationStrategies.jwt.verifyRefreshToken(refreshToken);
      const accessToken =
        await AuthenticationStrategies.jwt.signAccessToken(userId);
      // Refresh token change to ensure rotation
      const newRefreshToken =
        await AuthenticationStrategies.jwt.signRefreshToken(userId);

      return {
        success: true,
        document: { token: { access: accessToken, refresh: newRefreshToken } },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async logout(
    accessToken: string,
    refreshToken: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!refreshToken || !accessToken) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'Refresh and access token are required.',
        );
      }

      const { userId: userIdFromRefresh } =
        await AuthenticationStrategies.jwt.checkRefreshToken(refreshToken);
      const { userId: userIdFromAccess } =
        await AuthenticationStrategies.jwt.checkAccessToken(accessToken);

      if (userIdFromRefresh !== userIdFromAccess) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Access token does not match refresh token.',
        );
      }

      // Blacklist the access token
      await AuthenticationStrategies.jwt.blacklistToken(accessToken);

      // Remove the refresh token from Redis
      await AuthenticationStrategies.jwt.removeFromRedis(userIdFromRefresh);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!email) {
        throw new ErrorResponse('BAD_REQUEST', 'Email should be provided.');
      }

      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await otpService.generate(
        email,
        CONFIG.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async resetPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      // We suppose a verification about new password and confirmation password have already been done
      const { email, code, newPassword } = payload;

      const userResponse = (await userService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      if (!user.verified) {
        throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const validateOtpResponse = await otpService.validate(
        email,
        code,
        CONFIG.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const updatePasswordResponse = await userService.updatePassword(
        user.id,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }
}

export default new UserManagementService();
