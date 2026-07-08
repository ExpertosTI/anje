import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../common/utils';
import { Lead } from '../../entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(@InjectRepository(Lead) private repo: Repository<Lead>) {}

  findAll(limit = 500) {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  findByVendedor(vendedorId: string) {
    return this.repo.find({
      where: { vendedorId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Lead>) {
    const lead = this.repo.create({
      id: newId('ANJE-L'),
      estado: 'nuevo',
      origen: 'web',
      ...data,
    });
    return this.repo.save(lead);
  }

  async update(id: string, data: Partial<Lead>) {
    const lead = await this.repo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException();
    Object.assign(lead, data);
    return this.repo.save(lead);
  }

  async remove(id: string) {
    const r = await this.repo.delete(id);
    if (!r.affected) throw new NotFoundException();
    return { ok: true };
  }
}
