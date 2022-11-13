import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  subscription_token: string;

  @Column()
  name: string;

  @Column()
  guest_enroll: boolean;

  @Column({ name: 'opens_at' })
  opensAt: Date;

  @Column({ name: 'closes_at' })
  closesAt: Date;

  @Column()
  organization_id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
