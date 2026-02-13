import { JsonController, Body, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { LoginRequest } from '@api/requests/Auth/LoginRequest';
import { LoginService } from '@api/services/Auth/LoginService';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { NotificationService } from '@base/api/services/Notification/NotificationService';
import { NotificationTypeEnum } from '@base/api/interfaces/notification/NotificationInterface';

@Service()
@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/auth')
export class LoginController extends ControllerBase {
  public constructor(
    private loginService: LoginService,
    private notificationService: NotificationService
  ) {
    super();
  }

  @Post('/login')
  public async login(@Body() user: LoginRequest) {
    try {
      const authorization = await this.loginService.login(user);
      
      const userId = authorization?.user?.id;
      await this.notificationService
      .setSubject('Login Successful')
      .setMessage(
        `You have logged into your account successfully.`
      )
      .setTo({userId})
      .setCategory(NotificationTypeEnum.AUTH_LOGIN)
      .setDetails({
        userId,
        time: new Date().toISOString(),
      })
      .sendToDB()
      return {
        status: true,
        message: 'Login successful',
        data: authorization,
      }
    } catch (error) {
      throw error;
    }
  }
}
