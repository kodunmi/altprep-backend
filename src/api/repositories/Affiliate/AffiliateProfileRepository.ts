import { AffiliateProfile } from '@base/api/models/AffiliateProfile';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';

@Service()
@EntityRepository(AffiliateProfile)
export class AffiliateProfileRepository extends Repository<AffiliateProfile> {
  public async findByUserId(userId: number): Promise<AffiliateProfile | undefined> {
    return this.findOne({ where: { userId }, relations: ['user'] });
  }

  public async findByCode(referralCode: string): Promise<AffiliateProfile | undefined> {
    return this.findOne({ where: { referralCode } });
  }

  public async findBySubaccount(paystackSubaccountCode: string): Promise<AffiliateProfile | undefined> {
    return this.findOne({ where: { paystackSubaccountCode } });
  }
}
