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
  async create(
    name: string,
    email: string,
    password?: string,
  ): Promise<UserEntity> {
    const userEntity = this.usersRepository.create({
      name,
      email,
      password,
    });

    const userInDatabase = await this.usersRepository.save(userEntity);

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      email: userInDatabase.email,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
    };
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const userInDatabase = await this.usersRepository.findOne({
      where: { email },
    });

    if (!userInDatabase) return undefined;

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      email: userInDatabase.email,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
    };
  }
}
