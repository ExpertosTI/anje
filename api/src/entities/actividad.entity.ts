import {
  Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('anje_actividad_semanal')
export class ActividadSemanal {
  @PrimaryColumn('text')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column('text', { name: 'vendedor_id' })
  vendedorId!: string;

  @Column('date', { name: 'semana_inicio' })
  semanaInicio!: string;

  @Column('int', { default: 0 })
  prospectos!: number;

  @Column('int', { default: 0 })
  llamadas!: number;

  @Column('int', { default: 0 })
  demostraciones!: number;

  @Column('numeric', { name: 'monto_ventas', precision: 12, scale: 2, default: 0 })
  montoVentas!: number;

  @Column('int', { default: 0 })
  referidos!: number;

  @Column('int', { default: 0 })
  prospeccion!: number;

  @Column('int', { name: 'toque_puertas', default: 0 })
  toquePuertas!: number;

  @Column('text', { nullable: true })
  notas?: string;
}
