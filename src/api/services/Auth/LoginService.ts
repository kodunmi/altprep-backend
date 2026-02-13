import { Service } from 'typedi';
import { UserRepository } from '@api/repositories/Users/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { InvalidCredentials } from '@api/exceptions/Auth/InvalidCredentials';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { LoginRequest } from '@base/api/requests/Auth/LoginRequest';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { LoginResponseInterface } from '@base/api/interfaces/users/LoggedUserInterface';

@Service()
export class LoginService {
  constructor(@InjectRepository() private userRepository: UserRepository, private authService: AuthService, private hashService: HashService) {
    //
  }

  public async login(data: LoginRequest): Promise<LoginResponseInterface> {
    let user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: ['role'],
    });

    if (!user) {
      throw new InvalidCredentials();
    }

    if (!(await this.hashService.compare(data.password, user.password))) {
      throw new InvalidCredentials();
    }

    return this.authService.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        role: user.role.name,
      },
      { user: { id: user.id, email: user.email, role: user.role.name } },
    );
  }
}
