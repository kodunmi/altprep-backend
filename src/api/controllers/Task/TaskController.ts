import { JsonController, Get, Param, CurrentUser, QueryParams, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { TaskService } from '@base/api/services/Task/TaskService';
import { TaskRequestQuery } from '@base/api/requests/Task/TaskRequest';

@Service()
@JsonController('/tasks')
@OpenAPI({ security: [{ bearerAuth: [] }] })
@UseBefore(AuthCheck)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async listTasks(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: TaskRequestQuery) {
    const tasks = await this.taskService.listTasks(user.id, query.course_id);

    return {
      status: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
    };
  }

  @Get('/:taskId')
  async getTask(@Param('taskId') taskId: number, @CurrentUser() user: LoggedUserInterface) {
    const task = await this.taskService.getTask(user.id, taskId);

    return {
      status: true,
      message: 'Task retrieved successfully',
      data: task,
    };
  }
}
