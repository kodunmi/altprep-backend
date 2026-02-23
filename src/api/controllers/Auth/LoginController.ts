import { JsonController, Body, Post, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { LoginRequest } from '@api/requests/Auth/LoginRequest';
import { LoginService } from '@api/services/Auth/LoginService';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { NotificationService } from '@base/api/services/Notification/NotificationService';
import { NotificationTypeEnum } from '@base/api/interfaces/notification/NotificationInterface';
import { Response } from 'express';

@Service()
@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/auth')
export class LoginController extends ControllerBase {
  public constructor(private loginService: LoginService, private notificationService: NotificationService) {
    super();
  }

  @Post('/login')
  public async login(@Body() user: LoginRequest, @Res() res: Response) {
    try {
      const authorization = await this.loginService.login(user);

      const userId = authorization?.user?.id;
      await this.notificationService
        .setSubject('Login Successful')
        .setMessage(`You have logged into your account successfully.`)
        .setTo({ userId, email: authorization?.user?.email })
        .setCategory(NotificationTypeEnum.AUTH_LOGIN)
        .setDetails({
          userId,
          time: new Date().toISOString(),
        })
        .sendToDB();

      return this.response(res, 'Login Success', authorization, 'success');
    } catch (error) {
      return this.response(res, error.message, null, 'error');
    }
  }
}
