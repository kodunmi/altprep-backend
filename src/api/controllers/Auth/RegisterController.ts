import { Service } from 'typedi';
import { JsonController, Body, Post, Res } from 'routing-controllers';
import { RegisterRequest } from '@api/requests/Auth/RegisterRequest';
import { RegisterService } from '@api/services/Auth/RegisterService';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { Response } from 'express';

@Service()
@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/register')
export class RegisterController extends ControllerBase {
  public constructor(private registerService: RegisterService) {
    super();
  }

  @Post()
  public async register(@Body() user: RegisterRequest, @Res() res: Response) {
    try {
      const response = await this.registerService.register(user);

      return this.response(res, 'Registration successful, continue to payment', response, 'success');
    } catch (error) {
      return this.response(res, error.message, null, 'error');
    }
  }
}
