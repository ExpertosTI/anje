import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { weekStart } from '../../common/utils';
import { ActividadSemanal } from '../../entities/actividad.entity';

@Injectable()
export class ActividadService {
  constructor(@InjectRepository(ActividadSemanal) private repo: Repository<ActividadSemanal>) {}

  findAll(limit = 200) {
    return this.repo.find({ order: { semanaInicio: 'DESC' }, take: limit });
  }

  findBySemana(semana?: string) {
    const ws = semana || weekStart();
    return this.repo.find({ where: { semanaInicio: ws }, order: { vendedorId: 'ASC' } });
  }

  async upsert(data: Partial<ActividadSemanal> & { vendedorId: string; semanaInicio: string }) {
    const id = `${data.vendedorId}-${data.semanaInicio}`;
    let row = await this.repo.findOne({ where: { id } });
    if (row) {
      Object.assign(row, data, { id });
    } else {
      row = this.repo.create({
        id,
        prospectos: 0,
        llamadas: 0,
        demostraciones: 0,
        montoVentas: 0,
        referidos: 0,
        prospeccion: 0,
        toquePuertas: 0,
        ...data,
      });
    }
    return this.repo.save(row);
  }

  async dashboard(semana?: string) {
    const ws = semana || weekStart();
    const rows = await this.findBySemana(ws);
    return rows.reduce(
      (acc, a) => ({
        prospectos: acc.prospectos + a.prospectos,
        llamadas: acc.llamadas + a.llamadas,
        demostraciones: acc.demostraciones + a.demostraciones,
        montoVentas: acc.montoVentas + Number(a.montoVentas),
        referidos: acc.referidos + a.referidos,
        prospeccion: acc.prospeccion + a.prospeccion,
        toquePuertas: acc.toquePuertas + a.toquePuertas,
      }),
      { prospectos: 0, llamadas: 0, demostraciones: 0, montoVentas: 0, referidos: 0, prospeccion: 0, toquePuertas: 0 },
    );
  }
}
