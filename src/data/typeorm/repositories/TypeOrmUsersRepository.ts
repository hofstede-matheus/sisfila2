import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../domain/entities/User.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../entities/users';

export class TypeOrmUsersRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(user: UserEntity): Promise<string> {
    const userEntity = this.usersRepository.create(user);

    const userInDatabase = await this.usersRepository.save(userEntity);

    return userInDatabase.id;
  }
  findByEmail(email: string): Promise<UserEntity> {
    throw new Error('Method not implemented.');
  }
}
