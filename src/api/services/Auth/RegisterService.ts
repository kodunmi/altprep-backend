import { Service } from 'typedi';
import { UserRepository } from '@api/repositories/Users/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { PaymentService } from '@api/services/Payments/PaymentService';

@Service()
export class RegisterService {
  constructor(
    @InjectRepository() private userRepository: UserRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private authService: AuthService,
    private paymentService: PaymentService,
  ) {
    //
  }

  public async register(data: object) {
    let user = await this.userRepository.createUser({ ...data, role_id: 1 });

    user = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    this.eventDispatcher.dispatch('onUserRegister', user);

    const paymentInitialization = await this.paymentService.initializeOneTimePayment({
      userId: user.id,
      email: user.email,
      amount: 30000, // 30k NGN
      description: 'Registration Fee',
    });

    const authData = this.authService.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
      },
      { user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, is_active: user.is_active } },
    );

    return {
      ...authData,
      payment: {
        authorization_url: paymentInitialization.authorization_url,
        access_code: paymentInitialization.access_code,
        reference: paymentInitialization.reference,
        transactionId: paymentInitialization.transactionId,
      },
    };
  }
}
