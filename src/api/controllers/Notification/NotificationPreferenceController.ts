import { JsonController, Get, Put, Body, CurrentUser, UseBefore, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { NotificationPreferenceService } from '@base/api/services/Notification/NotificationPreferenceService';
import { UpdatePreferenceRequest } from '@base/api/requests/Notification/NotificationRequest';
import { Response } from 'express';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';

@JsonController('/settings/preferences')
@Service()
@UseBefore(AuthCheck)
@OpenAPI({ security: [{ bearerAuth: [] }] })
export class NotificationPreferenceController extends ControllerBase {
  constructor(private preferenceService: NotificationPreferenceService) {
    super();
  }

  @Get('/')
  async list(@CurrentUser() user: LoggedUserInterface, @Res() res: Response) {
    try {
      await this.preferenceService.initializeUserPreferences(user.id);

      const preference = await this.preferenceService.listUserPreferences(user.id);

      return this.response(res, 'Notification preferences fetched successfully', preference, 'success');
    } catch (error) {
      return this.response(res, error.message || 'Failed to fetch notification preferences', null, 'error');
    }
  }

  @Put()
  async update(@CurrentUser() user: LoggedUserInterface, @Body() body: UpdatePreferenceRequest, @Res() res: Response) {
    try {
      const updated = await this.preferenceService.update(user.id, body.type, body.enabled);

      return this.response(res, 'Notification preference updated successfully', updated, 'success');
    } catch (error) {
      return this.response(res, error.message || 'Failed to update notification preference', null, 'error');
    }
  }
}
