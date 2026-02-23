import { Param, Get, JsonController, Post, Body, Put, Delete, CurrentUser, UseBefore, QueryParams, Req, Res } from 'routing-controllers';
import { UserService } from '@api/services/Users/UserService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { UserUpdatePassword } from '@base/api/requests/Users/UserUpdateRequest';
import { CloudinaryService } from '@base/api/services/Cloudinary/CloudinaryService';
import multer from 'multer';
import { Response, Request } from 'express';

const upload = multer({ storage: multer.memoryStorage() });

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/users')
@UseBefore(AuthCheck)
export class UserController extends ControllerBase {
  public constructor(private userService: UserService, private cloudinaryService: CloudinaryService) {
    super();
  }

  @Get('/auth')
  public async getMe(@CurrentUser() user: LoggedUserInterface, @Res() res: Response) {
    const resourceOptions = {};
    const parseResourceOptions = new RequestQueryParser();

    try {
      const userData = await this.userService.findOneById(user.id, resourceOptions);

      return this.response(res, 'Login Success', userData, 'success');
    } catch (error) {
      return this.response(res, error.message, null, 'error');
    }
  }

  @Put('/password')
  public async updatePartnerUserPassword(@CurrentUser() user: LoggedUserInterface, @Body() body: UserUpdatePassword, @Res() res: Response) {
    try {
      if (body.password !== body.password_confirmation) {
        return this.response(res, 'Passwords do not match', null, 'error');
      }
      const updatedUser = await this.userService.updateUserPassword(user.id, body.password);

      return this.response(res, 'user password updated successfully', updatedUser, 'success');
    } catch (error) {
      return this.response(res, error.message, null, 'error');
    }
  }

  @Put('/auth')
  @UseBefore(upload.single('avatar'))
  public async update(@CurrentUser() user: LoggedUserInterface, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      let avatar_url: string | undefined = undefined;

      if (req.file) {
        const uploadedUrl = await this.cloudinaryService.uploadProfilePicture(req.file, {
          public_id: `user_${user.id}_avatar`,
          folder: 'avatars',
        });

        avatar_url = uploadedUrl;
      }
      const updateData = { ...body };

      if (avatar_url) {
        updateData.avatar_url = avatar_url;
      }

      const updatedUser = await this.userService.updateOneById(user.id, updateData);

      return this.response(res, 'User updated successfully', updatedUser, 'success');
    } catch (error: any) {
      console.error(error);
      return this.response(res, error.message || 'Failed to update user', null, 'error');
    }
  }
}
