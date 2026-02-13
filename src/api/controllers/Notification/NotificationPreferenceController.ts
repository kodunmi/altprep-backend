import { JsonController, Get, Put, Body, CurrentUser, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { User } from '@base/api/models/User';
import { NotificationPreferenceService } from '@base/api/services/Notification/NotificationPreferenceService';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { UpdatePreferenceRequest } from '@base/api/requests/Notification/NotificationRequest';

@JsonController('/settings/preferences')
@Service()
@UseBefore(AuthCheck)
@OpenAPI({ security: [{ bearerAuth: [] }] })
export class NotificationPreferenceController {
  constructor(private preferenceService: NotificationPreferenceService) {}

  @Get('/')
  async list(@CurrentUser() user: User) {
    await this.preferenceService.initializeUserPreferences(user.id);

    const preference = await this.preferenceService.listUserPreferences(user.id);

    return {
      status: true,
      message: 'Notification preference fetched successfully',
      data: preference,
    };
  }

  @Put()
  async update(@CurrentUser() user: User, @Body() body: UpdatePreferenceRequest) {
    const updated = await this.preferenceService.update(user.id, body.type, body.enabled);

    return updated;
  }
}
