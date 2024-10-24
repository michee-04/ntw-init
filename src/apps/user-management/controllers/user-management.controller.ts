/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
import { NextFunction, Request, Response } from 'express';
import { UserManagementService } from '../services';

export class UserManagementController {
  /**
   * @param req
   * @param res
   * @param next
   */
  static async registerUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await UserManagementService.register(req.body);
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async verifyAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await UserManagementService.verifyAccount(req.body);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}
