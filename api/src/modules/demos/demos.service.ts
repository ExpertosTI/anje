import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../common/utils';
import { Demo } from '../../entities/demo.entity';

@Injectable()
export class DemosService {
  constructor(@InjectRepository(Demo) private repo: Repository<Demo>) {}

  findAll(limit = 500) {
    return this.repo.find({ order: { fecha: 'DESC' }, take: limit });
  }

  findByVendedor(vendedorId: string) {
    return this.repo.find({
      where: { vendedorId },
      order: { fecha: 'DESC' },
    });
  }

  async create(data: Partial<Demo>) {
    const demo = this.repo.create({
      id: newId('ANJE-D'),
      estado: 'programada',
      montoVenta: 0,
      asistentes: 0,
      ...data,
    });
    return this.repo.save(demo);
  }

  async update(id: string, data: Partial<Demo>) {
    const demo = await this.repo.findOne({ where: { id } });
    if (!demo) throw new NotFoundException();
    Object.assign(demo, data);
    return this.repo.save(demo);
  }

  async remove(id: string) {
    const r = await this.repo.delete(id);
    if (!r.affected) throw new NotFoundException();
    return { ok: true };
  }
}
