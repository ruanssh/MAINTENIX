import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email já cadastrado');

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash,
        active: true,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async findById(id: bigint) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async list() {
    return this.prisma.users.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async update(id: bigint, dto: UpdateUserDto) {
    const existing = await this.prisma.users.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) throw new BadRequestException('Email já cadastrado');
    }

    const data = {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      active: dto.active,
    };

    const hasUpdates = Object.values(data).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException('Nenhuma informação para atualizar');
    }

    return this.prisma.users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
