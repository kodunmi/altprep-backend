import { JsonController, Get, Post, Body, CurrentUser, UseBefore, Param, QueryParams, Delete } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { NotificationService } from '@api/services/Notification/NotificationService';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { NotificationFiltersQuery, NotificationRequestBody } from '@base/api/requests/Notification/NotificationRequest';

@Service()
@JsonController('/notifications')
@UseBefore(AuthCheck)
@OpenAPI({ security: [{ bearerAuth: [] }] })
export class NotificationController {
  constructor(private notification: NotificationService) {}

  @Get()
  async index(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: NotificationFiltersQuery) {
    const result = await this.notification.getAll(user.id, query);
    const readCount = await this.notification.countByStatus(user.id, true);
    const unreadCount = await this.notification.countByStatus(user.id, false);

    return {
      status: true,
      message: 'Notifications fetched successfully',
      data: result.data,
      meta: { ...result.meta, readCount, unreadCount },
    };
  }

  @Get('/:id')
  async show(@CurrentUser() user: LoggedUserInterface, @Param('id') id: number) {
    const notification = await this.notification.getOne(id, true);
    if (notification.user_id !== user.id) {
      return { status: false, message: 'Not found' };
    }
    return {
      status: true,
      message: 'Notification fetched successfully',
      data: notification,
    };
  }

  @Post()
  async markRead(@CurrentUser() user: LoggedUserInterface, @Body() body: NotificationRequestBody) {
    const ids = body.ids;
    if (Array.isArray(ids) && ids.length > 0) {
      const updated = await this.notification.markSpecificAsRead(user.id, ids);
      return { status: true, message: 'Marked notifications as read', data: updated };
    } else {
      await this.notification.readAll(user.id);
      return { status: true, message: 'Marked all notifications as read' };
    }
  }

  @Delete()
  async remove(@CurrentUser() user: LoggedUserInterface, @Body() body: NotificationRequestBody) {
    const ids = body.ids;
    if (Array.isArray(ids) && ids.length > 0) {
      const deleted = await this.notification.deleteMany(user.id, ids);
      return { status: true, message: 'Notifications deleted', data: deleted };
    } else {
      const count = await this.notification.deleteAll(user.id);
      return { status: true, message: `Deleted ${count} notifications` };
    }
  }
}
