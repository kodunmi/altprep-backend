import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TransactionRepository } from '@api/repositories/Payments/TransactionRepository';
import { Transaction } from '@api/models/Payments/Transaction';
import { TransactionRequest } from '@api/requests/Payments/TransactionRequest';

@Service()
export class TransactionService {
  constructor(@InjectRepository() private transactionRepository: TransactionRepository) {}

  public async getAll(query: TransactionRequest, userId: number) {
    const { page = 1, limit = 10, status } = query;

    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['user'],
      // order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findOneById(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  public async deleteOneById(id: string) {
    const transaction = await this.findOneById(id);
    await this.transactionRepository.remove(transaction);
    return true;
  }
}
