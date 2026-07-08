import {
  Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('anje_leads')
export class Lead {
  @PrimaryColumn('text')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column('text')
  nombre!: string;

  @Column('text')
  telefono!: string;

  @Column('text', { nullable: true })
  email?: string;

  @Column('text', { nullable: true })
  whatsapp?: string;

  @Column('text', { nullable: true })
  producto?: string;

  @Column('text', { nullable: true })
  direccion?: string;

  @Column('text', { nullable: true })
  ciudad?: string;

  @Column('text', { nullable: true })
  comentarios?: string;

  @Column('text', { default: 'nuevo' })
  estado!: string;

  @Column('text', { default: 'web' })
  origen!: string;

  @Column('text', { name: 'vendedor_id', nullable: true })
  vendedorId?: string;
}
