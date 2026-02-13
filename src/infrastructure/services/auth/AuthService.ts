import { authConfig } from '@base/config/auth';
import { Service } from 'typedi';
import { JWTProvider } from './Providers/JWTProvider';
import { LoginResponseInterface } from '@base/api/interfaces/users/LoggedUserInterface';

@Service()
export class AuthService {
  private provider: any;

  public constructor() {
    this.setProvider(authConfig.defaultProvider);
  }

  public setProvider(provider: string): this {
    switch (provider) {
      case 'jwt':
        this.provider = new JWTProvider();

      default:
        break;
    }

    return this;
  }

  public sign(payload: object, dataReturn: LoginResponseInterface): LoginResponseInterface {
    return this.provider.sign(payload, dataReturn);
  }
}
