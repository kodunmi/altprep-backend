import {
    JsonController,
    Get,
    Post,
    Body,
    CurrentUser,
    Param,
    QueryParams,
    UseBefore,
  } from 'routing-controllers';
  import { OpenAPI } from 'routing-controllers-openapi';
  import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
  import { Service } from 'typedi';
import { EventService } from '@base/api/services/Event/EventService';
import { EventRegistrationRequest, EventRequestQuery } from '@base/api/requests/Event/EventRequest';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
  
  @JsonController('/events')
  @OpenAPI({ security: [{ bearerAuth: [] }] })
  @UseBefore(AuthCheck)
  @Service()
  export class EventController {
    constructor(private eventService: EventService) {}
  
    @Get()
    async list(@QueryParams() filters: EventRequestQuery) {
      const events = await this.eventService.listEvents(filters);
      return {
        status: true,
        message: 'Events retrieved successfully',
        ...events,
      };
    }

    @Post('/:id/registrations')
    async register(
      @CurrentUser() user: LoggedUserInterface,
      @Param('id') id: number,
      @Body() body: EventRegistrationRequest,
    ) {
      const registration = await this.eventService.register(user.id, {...body, event_id: id});
  
      return {
        status: true,
        message: 'Event registered successfully',
        data: registration,
      };
    }
  
    @Get('/registrations')
    async listRegistrations(@CurrentUser() user: LoggedUserInterface) {
      const registrations = await this.eventService.listUserRegistrations(user.id);
  
      return {
        status: true,
        message: 'Registrations retrieved successfully',
        data: registrations,
      };
    }

      
    @Get('/:id')
    async getOne(@Param('id') id: number) {
      const event = await this.eventService.getEvent(id);
      return {
        status: true,
        message: 'Event fetched successfully',
        data: event,
      };
    }

  }
  