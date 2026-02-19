import { Transaction } from '@api/models/Payments/Transaction';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Transaction)
export class TransactionRepository extends RepositoryBase<Transaction> {
  public async createTransaction(data: Object): Promise<Transaction> {

   const inputs = data as {
    userId: number;
    amount: number;
    status: string;
    paymentMethod?: string;
    transactionRef: string;
    description?: string;
  }
    const transaction = this.create({
      userId: inputs.userId,
      amount: inputs.amount,
      status: inputs.status,
      paymentMethod: inputs.paymentMethod || null,
      transactionRef: inputs.transactionRef,
      description: inputs.description || null,
    });

    return await this.save(transaction);
  }

  public async updateTransaction(transaction: Transaction, data: object) {
    Object.assign(transaction, data);

    return await transaction.save();
  }

  public async findByTransactionRef(transactionRef: string) {
    return await this.findOne({ where: { transactionRef } });
  }
}
