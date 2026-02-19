import { JsonController, Get, Post, Body, CurrentUser, UseBefore, Param, QueryParams, Delete, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { NotificationService } from '@api/services/Notification/NotificationService';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { NotificationFiltersQuery, NotificationRequestBody } from '@base/api/requests/Notification/NotificationRequest';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { Response } from 'express';

@Service()
@JsonController('/notifications')
@UseBefore(AuthCheck)
@OpenAPI({ security: [{ bearerAuth: [] }] })
export class NotificationController extends ControllerBase {
  constructor(private notification: NotificationService) {
    super();
  }

  @Get()
  async index(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: NotificationFiltersQuery, @Res() res: Response) {
    try {
      const result = await this.notification.getAll(user.id, query);
      const readCount = await this.notification.countByStatus(user.id, true);
      const unreadCount = await this.notification.countByStatus(user.id, false);

      return this.response(
        res,
        'Notifications fetched successfully',
        {
          data: result.data,
          meta: { ...result.meta, readCount, unreadCount },
        },
        'success',
      );
    } catch (error) {
      return this.response(res, error.message || 'Failed to fetch notifications', null, 'error');
    }
  }

  @Get('/:id')
  async show(@CurrentUser() user: LoggedUserInterface, @Param('id') id: number, @Res() res: Response) {
    try {
      const notification = await this.notification.getOne(id, true);

      if (!notification || notification.user_id !== user.id) {
        return this.response(res, 'Notification not found', null, 'error');
      }

      return this.response(res, 'Notification fetched successfully', notification, 'success');
    } catch (error) {
      return this.response(res, error.message || 'Failed to fetch notification', null, 'error');
    }
  }

  @Post()
  async markRead(@CurrentUser() user: LoggedUserInterface, @Body() body: NotificationRequestBody, @Res() res: Response) {
    try {
      const ids = body.ids;

      if (Array.isArray(ids) && ids.length > 0) {
        const updated = await this.notification.markSpecificAsRead(user.id, ids);
        return this.response(res, 'Marked notifications as read', updated, 'success');
      }

      await this.notification.readAll(user.id);
      return this.response(res, 'Marked all notifications as read', null, 'success');
    } catch (error) {
      return this.response(res, error.message || 'Failed to mark notifications as read', null, 'error');
    }
  }

  @Delete()
  async remove(@CurrentUser() user: LoggedUserInterface, @Body() body: NotificationRequestBody, @Res() res: Response) {
    try {
      const ids = body.ids;

      if (Array.isArray(ids) && ids.length > 0) {
        const deleted = await this.notification.deleteMany(user.id, ids);
        return this.response(res, 'Notifications deleted', deleted, 'success');
      }

      const count = await this.notification.deleteAll(user.id);
      return this.response(res, `Deleted ${count} notifications`, { deletedCount: count }, 'success');
    } catch (error) {
      return this.response(res, error.message || 'Failed to delete notifications', null, 'error');
    }
  }
}
