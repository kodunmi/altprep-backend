import { JsonController, Get, Post, Body, CurrentUser, UseBefore, Param, QueryParams, Put } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { CourseService } from '@api/services/Course/CourseService';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { Request, Response } from 'express';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { UserUpdateRequest } from '@base/api/requests/Users/UserUpdateRequest';
import { CourseRequest } from '@base/api/requests/Course/CourseRequest';
import { LessonRequest, LessonUpdateRequest } from '@base/api/requests/Lesson/LessonRequest';
import { LessonService } from '@base/api/services/Lesson/LessonService';


@Service()
@JsonController('/courses')
@OpenAPI({
    security: [{ bearerAuth: [] }],
})
@UseBefore(AuthCheck)
export class CourseController {
  constructor(
    private lessonService: LessonService,private courseService: CourseService) {}

  @Get()
  async userCourses(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: CourseRequest) { 
    const courses = await this.courseService.getUserCourses(user.id, query);
    return {
        status: true,
        message: 'Courses retrieved successfully',
        ...courses,
    }
  }

  @Get('/:id')
  async findCourse(@CurrentUser() user: LoggedUserInterface, @Param('id') id: number) {
    const course = await this.courseService.findCourse(user.id, id);
    return {
        status: true,
        message: 'Course fetched successfully',
        data: course,
    }
  }

  @Get('/:id/lessons')
  async listLessons(
    @Param('id') courseId: number,
    @CurrentUser() user: LoggedUserInterface,
    @QueryParams() query: LessonRequest,
  ) {
    const lessons = await this.lessonService.findCourseLessons(user.id, courseId, query);
    return {
        status: true,
        message: 'Lessons retrieved successfully',
        ...lessons,
    }
  }

  @Get('/lessons/:lessonId')
  async findLesson(
    @Param('lessonId') lessonId: number,
    @CurrentUser() user: LoggedUserInterface,
  ) {
    const lesson = await this.lessonService.findLesson(user.id, lessonId);
    return {
        status: true,
        message: 'Lesson fetched successfully',
        data: lesson,
    }
  }

  @Put('/lessons/:lessonId/progress')
  async updateProgress(
    @CurrentUser() user: LoggedUserInterface,
    @Param('lessonId') lessonId: number,
    @Body() body: LessonUpdateRequest,
  ) {
    await this.lessonService.updateProgress(user.id, lessonId, body.current_time);
    return {
        status: true,
        message: 'Lesson progress updated successfully',
    }
  }

  @Put('/lessons/:lessonId/complete')
  async markLessonCompleted(
    @CurrentUser() user: LoggedUserInterface,
    @Param('lessonId') lessonId: number,
  ) {
    await this.lessonService.markCompleted(user.id, lessonId);
    return {
        status: true,
        message: 'Lesson progress updated successfully',
    }
  }
}
