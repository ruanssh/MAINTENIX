import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMachineDto, createdBy: bigint) {
    return this.prisma.machines.create({
      data: {
        name: dto.name,
        line: dto.line,
        location: dto.location,
        model: dto.model,
        serial_number: dto.serial_number,
        photo_url: dto.photo_url,
        created_by: createdBy,
      },
      select: {
        id: true,
        name: true,
        line: true,
        location: true,
        model: true,
        serial_number: true,
        photo_url: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async list() {
    return this.prisma.machines.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        line: true,
        location: true,
        model: true,
        serial_number: true,
        photo_url: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findById(id: bigint) {
    const machine = await this.prisma.machines.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        line: true,
        location: true,
        model: true,
        serial_number: true,
        photo_url: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!machine) throw new NotFoundException('Máquina não encontrada');
    return machine;
  }

  async update(id: bigint, dto: UpdateMachineDto) {
    const exists = await this.prisma.machines.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Máquina não encontrada');

    return this.prisma.machines.update({
      where: { id },
      data: {
        name: dto.name,
        line: dto.line,
        location: dto.location,
        model: dto.model,
        serial_number: dto.serial_number,
        photo_url: dto.photo_url,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        line: true,
        location: true,
        model: true,
        serial_number: true,
        photo_url: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async remove(id: bigint) {
    const exists = await this.prisma.machines.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Máquina não encontrada');

    return this.prisma.machines.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        line: true,
        location: true,
        model: true,
        serial_number: true,
        photo_url: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
