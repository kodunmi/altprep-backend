import { JsonController, Post, Body } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { PasswordResetService } from '@api/services/Auth/PasswordResetService';
import { ForgotPasswordRequest, PasswordResetRequest } from '@base/api/requests/Auth/PasswordResetRequest';

@Service()
@OpenAPI({ tags: ['Auth'] })
@JsonController('/auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('/forgot-password')
  async requestReset(@Body() body: ForgotPasswordRequest) {
    return await this.passwordResetService.requestReset(body.email);
  }

  @Post('/reset-password')
  async reset(@Body() body: PasswordResetRequest) {
    if(body.password !== body.password_confirmation) throw new Error('Passwords do not match');
    return await this.passwordResetService.reset(body.token, body.password);
  }
}
