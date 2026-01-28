import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@ApiTags('machines')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('machines')
export class MachinesController {
  constructor(private readonly machines: MachinesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateMachineDto) {
    const createdBy = this.parseId(req.user.sub);
    return this.machines.create(dto, createdBy);
  }

  @Get()
  list() {
    return this.machines.list();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.machines.findById(this.parseId(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMachineDto) {
    return this.machines.update(this.parseId(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.machines.remove(this.parseId(id));
  }

  private parseId(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}
