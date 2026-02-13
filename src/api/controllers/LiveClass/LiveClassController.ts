import { JsonController, Get, QueryParams, Param, CurrentUser, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';

import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { LiveClassRecordingQuery, LiveClassRequestQuery } from '@api/requests/LiveClass/LiveClassRequest';
import { LiveClassService } from '@base/api/services/LiveClass/LiveClassService';

@Service()
@JsonController('/live-classes')
@OpenAPI({ security: [{ bearerAuth: [] }] })
@UseBefore(AuthCheck)
export class LiveClassController {
  constructor(private liveClassService: LiveClassService) {}

  @Get()
  async listClasses(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: LiveClassRequestQuery) {
    const classes = await this.liveClassService.listUserClasses(user.id, query.course_id);
    return {
      status: true,
      message: 'Live classes retrieved successfully',
      data: classes,
    };
  }

  @Get('/recordings')
  async findClassRecord(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: LiveClassRecordingQuery) {    
    const record = await this.liveClassService.listRecordings(user.id, query);
    return {
      status: true,
      message: 'Live class record fetched successfully',
      data: record,
    };
  }

  @Get('/:id')
  async findClass(@CurrentUser() user: LoggedUserInterface, @Param('id') id: number) {
    const record = await this.liveClassService.findClass(user.id, id);
    return {
      status: true,
      message: 'Live class fetched successfully',
      data: record,
    };
  }

}
