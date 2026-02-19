import { Get, JsonController, Post, Body, UseBefore, QueryParam, HeaderParam, Res } from 'routing-controllers';
import { PaymentService } from '@api/services/Payments/PaymentService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { LoggedUser } from '@base/decorators/LoggedUser';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { Response } from 'express';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
  tags: ['Payments'],
})
@JsonController('/payments')
export class PaymentController extends ControllerBase {
  public constructor(private paymentService: PaymentService) {
    super();
  }

  /**
   * Initialize a one-time payment
   */
  @Post('/initialize')
  @UseBefore(AuthCheck)
  @OpenAPI({
    summary: 'Initialize a one-time payment',
    description: 'Creates a Paystack payment for registration or other one-time charges',
  })
  public async initializePayment(
    @LoggedUser() loggedUser: LoggedUserInterface,
    @Res() response: Response,
  ) {

    const payload = {
      userId: loggedUser.id,
       email: loggedUser.email,
        amount: 300000,
        description: "Registration payment",
    }
    try {
      const res = await this.paymentService.initializeOneTimePayment(payload);

      return this.response(response, 'Payment initialized successfully', res, 'success');
    } catch (error) {
      return this.response(response, error.message, null, 'error');
    }
  }

  /**
   * Verify a payment
   */
  @Get('/verify')
  @UseBefore(AuthCheck)
  @OpenAPI({
    summary: 'Verify a payment',
    description: 'Verifies a payment transaction with Paystack',
  })
  public async verify(@QueryParam('reference') reference: string, @Res() response: Response) {
    try {
      const res = await this.paymentService.verifyPayment(reference);

      return this.response(response, 'Payment verified successfully', res, 'success');
    } catch (error) {
      return this.response(response, error.message, null, 'error');
    }
  }

  /**
   * Webhook endpoint for Paystack events
   */
  @Post('/webhook')
  @OpenAPI({
    security: [],
    summary: 'Paystack webhook endpoint',
    description: 'Receives webhook events from Paystack for payment updates',
  })
  public async webhook(@Body() event: any, @HeaderParam('x-paystack-signature') signature: string, @Res() response: Response) {
    try {
      const res = await this.paymentService.handleWebhook(event, signature);
      return this.response(response, 'Webhook processed successfully', res, 'success');
    } catch (error) {
      return this.response(response, error.message, null, 'error');
    }
  }
}