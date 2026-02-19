import { Param, Get, JsonController, Delete, HttpCode, UseBefore, QueryParams, CurrentUser, Res } from 'routing-controllers';
import { TransactionService } from '@api/services/Payments/TransactionService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OpenAPI } from 'routing-controllers-openapi';
import { TransactionRequest } from '@api/requests/Payments/TransactionRequest';
import { LoggedUserInterface } from '@api/interfaces/users/LoggedUserInterface';
import { Response } from 'express';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
  tags: ['Transactions'],
})
@JsonController('/transactions')
@UseBefore(AuthCheck)
export class TransactionController extends ControllerBase {
  public constructor(private transactionService: TransactionService) {
    super();
  }

  @Get()
  @OpenAPI({
    summary: 'Get all transactions',
    description: 'Retrieve all transactions with optional filtering, sorting, and pagination',
  })
  public async getAll(@CurrentUser() user: LoggedUserInterface, @QueryParams() query: TransactionRequest, @Res() res: Response) {
    try {
      const transactions = await this.transactionService.getAll(query, user.id);

      return this.response(res, 'Transactions retrieved successfully', transactions, 'success');
    } catch (error) {
      console.log('error trx', error);

      return this.response(res, 'Error retrieving transactions', null, 'error');
    }
  }

  @Get('/:id')
  @OpenAPI({
    summary: 'Get transaction by ID',
    description: 'Retrieve a specific transaction by its UUID',
  })
  public async getOne(@CurrentUser() user: LoggedUserInterface, @Param('id') id: string) {
    const transaction = await this.transactionService.findOneById(id);
    return {
      status: true,
      message: 'Transaction fetched successfully',
      data: transaction,
    };
  }

  @Delete('/:id')
  @HttpCode(204)
  @OpenAPI({
    summary: 'Delete transaction',
    description: 'Delete a transaction by its ID',
  })
  public async delete(@CurrentUser() user: LoggedUserInterface, @Param('id') id: string) {
    await this.transactionService.deleteOneById(id);
    return {
      status: true,
      message: 'Transaction deleted successfully',
    };
  }
}
