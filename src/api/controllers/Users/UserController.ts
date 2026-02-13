import { Param, Get, JsonController, Post, Body, Put, Delete, CurrentUser, UseBefore, QueryParams, Req } from 'routing-controllers';
import { UserService } from '@api/services/Users/UserService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { UserUpdatePassword } from '@base/api/requests/Users/UserUpdateRequest';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/users')
@UseBefore(AuthCheck)
export class UserController extends ControllerBase {
  public constructor(private userService: UserService) {
    super();
  }

  @Get('/auth')
  public async getMe(@CurrentUser() user: LoggedUserInterface) {
    const resourceOptions = {};
    const parseResourceOptions = new RequestQueryParser();

    return await this.userService.findOneById(user.id, resourceOptions);
  }

  @Put('/password')
  public async updatePartnerUserPassword(@CurrentUser() user: LoggedUserInterface, @Body() body: UserUpdatePassword) {
    if(body.password !== body.password_confirmation) throw new Error('Passwords do not match');
    await this.userService.updateUserPassword(user.id, body.password)

    return {
      status: true,
      message: 'user password updated successfully'
    }
  }
}
