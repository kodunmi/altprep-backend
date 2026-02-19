import { User } from '@api/models/User';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(User)
export class UserRepository extends RepositoryBase<User> {
  public async createUser(data: object) {

    try {
       let entity = new User();

    console.log('user data', data);
    

    Object.assign(entity, data);

    return await this.save(entity);
    } catch (error) {
      
      console.log('error in save', error);
      
    }
   
  }

  public async updateUser(user: User, data: object) {
    Object.assign(user, data);

    return await user.save(data);
  }
}
