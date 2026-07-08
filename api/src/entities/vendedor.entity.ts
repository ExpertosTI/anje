import {
  Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('anje_vendedores')
export class Vendedor {
  @PrimaryColumn('text')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column('text')
  nombre!: string;

  @Column('text', { nullable: true })
  telefono?: string;

  @Column('text', { nullable: true })
  email?: string;

  @Column('text', { nullable: true })
  whatsapp?: string;

  @Column('text')
  pin!: string;

  @Column('text', { nullable: true })
  zona?: string;

  @Column('boolean', { default: true })
  activo!: boolean;
}
