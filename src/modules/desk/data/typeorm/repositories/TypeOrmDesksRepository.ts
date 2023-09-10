import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeskEntity } from '../../../domain/entities/Desk.entity';
import { DeskRepository } from '../../../domain/repositories/DeskRepository';
import { Desk } from '../entities/desks.typeorm-entity';

export class TypeOrmDesksRepository implements DeskRepository {
  constructor(
    @InjectRepository(Desk)
    private readonly desksRepository: Repository<Desk>,
  ) {}

  async create(name: string, organizationId: string): Promise<DeskEntity> {
    const newDesk = this.desksRepository.create({ name, organizationId });

    await this.desksRepository.save(newDesk);
    return {
      id: newDesk.id,
      name: newDesk.name,
      organizationId: newDesk.organizationId,
      services: [],
      createdAt: newDesk.createdAt,
      updatedAt: newDesk.updatedAt,
    };
  }
}
