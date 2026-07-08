import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../common/utils';
import { Vendedor } from '../../entities/vendedor.entity';

@Injectable()
export class VendedoresService {
  constructor(@InjectRepository(Vendedor) private repo: Repository<Vendedor>) {}

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  findActive() {
    return this.repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  async create(data: Partial<Vendedor>) {
    const v = this.repo.create({
      id: newId('ANJE-V'),
      activo: true,
      ...data,
    });
    return this.repo.save(v);
  }

  async update(id: string, data: Partial<Vendedor>) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException();
    Object.assign(v, data);
    return this.repo.save(v);
  }
}
