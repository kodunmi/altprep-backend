import { JsonController, Post, Body, Res } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { PasswordResetService } from '@api/services/Auth/PasswordResetService';
import { ForgotPasswordRequest, PasswordResetRequest } from '@base/api/requests/Auth/PasswordResetRequest';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { Response } from 'express';

@Service()
@OpenAPI({ tags: ['Auth'] })
@JsonController('/auth')
export class PasswordResetController  extends ControllerBase  {
  public constructor(private readonly passwordResetService: PasswordResetService) {
    super()
  }

  @Post('/forgot-password')
  async requestReset(@Body() body: ForgotPasswordRequest,  @Res() res: Response) {
    try {
      const response = await this.passwordResetService.requestReset(body.email);

      return this.response(res, response.message,null, 'success');
    } catch (error) {
       return this.response(res, error.message, null, 'error');
    }
    
  }

  @Post('/reset-password')
  async reset(@Body() body: PasswordResetRequest,  @Res() res: Response) {

    try {
       if(body.password !== body.password_confirmation) throw new Error('Passwords do not match');
    const response = await this.passwordResetService.reset(body.token, body.password);
return this.response(res, response.message, null, 'success');

    } catch (error) {
      return this.response(res, error.message, null, 'error');
    }
   
  }
}
