import { Referral } from '@base/api/models/Referral';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

@Service()
@EntityRepository(Referral)
export class ReferralRepository extends Repository<Referral> {
  public async createReferral(data: Partial<Referral>): Promise<Referral> {
    const referral = this.create(data);
    return this.save(referral);
  }

  public async findByReferrerId(referrerId: number): Promise<Referral[]> {
    return this.find({
      where: { referrerId },
      relations: ['referredUser'],
      order: { createdAt: 'DESC' },
    });
  }

  public async findByCode(referralCode: string): Promise<Referral | undefined> {
    return this.findOne({ where: { referralCode } });
  }

  public async countConversions(referrerId: number): Promise<number> {
    return this.count({ where: { referrerId, status: 'converted' } });
  }
}
