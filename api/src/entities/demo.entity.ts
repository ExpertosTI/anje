import {
  Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('anje_demostraciones')
export class Demo {
  @PrimaryColumn('text')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column('text', { name: 'lead_id', nullable: true })
  leadId?: string;

  @Column('text', { name: 'vendedor_id', nullable: true })
  vendedorId?: string;

  @Column('date')
  fecha!: string;

  @Column('text', { nullable: true })
  hora?: string;

  @Column('text')
  lugar!: string;

  @Column('text', { nullable: true })
  direccion?: string;

  @Column('text', { nullable: true })
  producto?: string;

  @Column('text', { default: 'programada' })
  estado!: string;

  @Column('text', { nullable: true })
  notas?: string;

  @Column('numeric', { name: 'monto_venta', precision: 12, scale: 2, default: 0 })
  montoVenta!: number;

  @Column('int', { default: 0 })
  asistentes!: number;
}
