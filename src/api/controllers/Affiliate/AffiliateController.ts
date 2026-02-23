import { Service } from 'typedi';
import { Request, Response } from 'express';
import { JsonController, Get, Post, Body, Req, Res, Param, QueryParam, UseBefore, CurrentUser } from 'routing-controllers';
import { AffiliateService } from '@base/api/services/Affiliate/Affiliateservice';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { OpenAPI } from 'routing-controllers-openapi/build';

interface RegisterAffiliateBody {
  businessName?: string;
  bankCode: string;
  accountNumber: string;
  commissionRate?: number;
}

@Service()
@OpenAPI({
  tags: ['Affiliates'],
})
@JsonController('/affiliates')
export class AffiliateController {
  constructor(private affiliateService: AffiliateService) {}

  // ─── GET /affiliates/banks ─────────────────────────────────────────────────
  @Get('/banks')
  @UseBefore(AuthCheck)
  async getBanks(@Res() res: Response) {
    try {
      const banks = await this.affiliateService.getBanks();
      return res.json({ status: true, data: banks });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  }

  // ─── POST /affiliates/verify-account ──────────────────────────────────────
  @Post('/verify-account')
  @UseBefore(AuthCheck)
  async verifyAccount(@Body() body: { accountNumber: string; bankCode: string }, @Res() res: Response) {
    try {
      const data = await this.affiliateService.verifyBankAccount(body.accountNumber, body.bankCode);
      return res.json({ status: true, data });
    } catch (error) {
      console.log('Verification error', error);

      return res.status(400).json({ status: false, message: 'Could not verify account. Check details and try again.' });
    }
  }

  // ─── POST /affiliates/register ─────────────────────────────────────────────
  @Post('/register')
  @UseBefore(AuthCheck)
  async register(@Body() body: RegisterAffiliateBody, @CurrentUser() user: LoggedUserInterface, @Res() res: Response) {
    try {
      const userId = user.id;
      const profile = await this.affiliateService.registerAffiliate({
        userId,
        businessName: body.businessName,
        bankCode: body.bankCode,
        accountNumber: body.accountNumber,
        commissionRate: body.commissionRate,
      });
      return res.status(201).json({ status: true, data: profile });
    } catch (error) {
      console.log('ref error', error);

      return res.status(400).json({ status: false, message: error.message });
    }
  }

  // ─── GET /affiliates/dashboard ─────────────────────────────────────────────
  @Get('/dashboard')
  @UseBefore(AuthCheck)
  async getDashboard(@CurrentUser() user: LoggedUserInterface, @Res() res: Response) {
    try {
      const userId = user.id;
      const data = await this.affiliateService.getAffiliateDashboard(userId);
      return res.json({ status: true, data });
    } catch (error) {
      return res.status(404).json({ status: false, message: error.message });
    }
  }

  // ─── GET /affiliates/track/:code ──────────────────────────────────────────
  // Called when someone visits a referral link — track click then redirect
  @Get('/track/:code')
  async trackClick(@Param('code') code: string, @Res() res: Response) {
    await this.affiliateService.trackClick(code);
    const redirectUrl = `${process.env.APP_URL}/register?ref=${code}`;
    return res.redirect(redirectUrl);
  }

  // ─── Admin: GET /affiliates/admin/all ─────────────────────────────────────
  @Get('/admin/all')
  @UseBefore(AuthCheck)
  async getAllAffiliates(@QueryParam('page') page = 1, @QueryParam('limit') limit = 20, @Res() res: Response) {
    try {
      const data = await this.affiliateService.getAllAffiliates(page, limit);
      return res.json({ status: true, ...data });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  }
}
