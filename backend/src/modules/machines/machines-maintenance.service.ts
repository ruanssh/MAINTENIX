import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMaintenanceRecordDto,
  MaintenanceRecordPriority,
} from './dto/create-maintenance-record.dto';
import { FinishMaintenanceRecordDto } from './dto/finish-maintenance-record.dto';
import {
  CreateMaintenanceEventDto,
  MaintenanceEventType,
} from './dto/create-maintenance-event.dto';
import { ListMaintenanceRecordsQueryDto } from './dto/list-maintenance-records.dto';
import {
  CreateMaintenancePhotoDto,
  MaintenancePhotoType,
} from './dto/create-maintenance-photo.dto';
import { MinioService } from '../../storage/minio.service';
type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class MachinesMaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioService,
  ) {}

  async createRecord(
    machineId: bigint,
    dto: CreateMaintenanceRecordDto,
    createdBy: bigint,
  ) {
    await this.ensureMachine(machineId);

    return this.prisma.maintenance_records.create({
      data: {
        machine_id: machineId,
        created_by: createdBy,
        status: 'PENDING',
        priority: dto.priority ?? MaintenanceRecordPriority.MEDIUM,
        category: dto.category,
        shift: dto.shift,
        problem_description: dto.problem_description,
        started_at: dto.started_at ? new Date(dto.started_at) : null,
      },
      select: this.recordSelect(),
    });
  }

  async listRecords(machineId: bigint, query: ListMaintenanceRecordsQueryDto) {
    await this.ensureMachine(machineId);

    return this.prisma.maintenance_records.findMany({
      where: {
        machine_id: machineId,
        status: query.status,
      },
      orderBy: { created_at: 'desc' },
      select: this.recordSelect(),
    });
  }

  async findRecord(machineId: bigint, recordId: bigint) {
    const record = await this.prisma.maintenance_records.findFirst({
      where: { id: recordId, machine_id: machineId },
      select: this.recordSelect(),
    });
    if (!record) throw new NotFoundException('Registro não encontrado');
    return record;
  }

  async finishRecord(
    machineId: bigint,
    recordId: bigint,
    dto: FinishMaintenanceRecordDto,
    finishedBy: bigint,
  ) {
    const existing = await this.prisma.maintenance_records.findFirst({
      where: { id: recordId, machine_id: machineId },
    });
    if (!existing) throw new NotFoundException('Registro não encontrado');
    if (existing.status === 'DONE') {
      throw new BadRequestException('Registro já finalizado');
    }

    return this.prisma.maintenance_records.update({
      where: { id: recordId },
      data: {
        status: 'DONE',
        solution_description: dto.solution_description,
        finished_by: finishedBy,
        finished_at: dto.finished_at ? new Date(dto.finished_at) : new Date(),
        updated_at: new Date(),
      },
      select: this.recordSelect(),
    });
  }

  async createEvent(
    machineId: bigint,
    recordId: bigint,
    dto: CreateMaintenanceEventDto,
    createdBy: bigint,
  ) {
    await this.ensureRecord(machineId, recordId);

    return this.prisma.maintenance_events.create({
      data: {
        maintenance_record_id: recordId,
        machine_id: machineId,
        component_name: dto.component_name,
        event_type: dto.event_type as MaintenanceEventType,
        event_date: new Date(dto.event_date),
        used_part_description: dto.used_part_description,
        quantity: dto.quantity,
        removed_condition: dto.removed_condition,
        destination: dto.destination,
        observation: dto.observation,
        photo_url: dto.photo_url,
        created_by: createdBy,
      },
      select: this.eventSelect(),
    });
  }

  async listEvents(machineId: bigint, recordId: bigint) {
    await this.ensureRecord(machineId, recordId);

    return this.prisma.maintenance_events.findMany({
      where: { machine_id: machineId, maintenance_record_id: recordId },
      orderBy: [{ event_date: 'desc' }, { created_at: 'desc' }],
      select: this.eventSelect(),
    });
  }

  async createPhoto(
    machineId: bigint,
    recordId: bigint,
    dto: CreateMaintenancePhotoDto,
    file: UploadedFile,
    createdBy: bigint,
  ) {
    await this.ensureRecord(machineId, recordId);

    const safeName = file.originalname.replace(/[^\w.-]/g, '_');
    const folder = dto.type === MaintenancePhotoType.BEFORE ? 'before' : 'after';
    const objectName = `maintenance-records/${recordId}/${folder}/${Date.now()}-${safeName}`;

    const fileUrl = await this.storage.upload({
      objectName,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    return this.prisma.maintenance_photos.create({
      data: {
        maintenance_record_id: recordId,
        type: dto.type,
        file_url: fileUrl,
        created_by: createdBy,
      },
      select: this.photoSelect(),
    });
  }

  async listPhotos(machineId: bigint, recordId: bigint) {
    await this.ensureRecord(machineId, recordId);

    return this.prisma.maintenance_photos.findMany({
      where: { maintenance_record_id: recordId },
      orderBy: { created_at: 'desc' },
      select: this.photoSelect(),
    });
  }

  private async ensureMachine(machineId: bigint) {
    const exists = await this.prisma.machines.findUnique({
      where: { id: machineId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Máquina não encontrada');
  }

  private async ensureRecord(machineId: bigint, recordId: bigint) {
    const exists = await this.prisma.maintenance_records.findFirst({
      where: { id: recordId, machine_id: machineId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Registro não encontrado');
  }

  private recordSelect() {
    return {
      id: true,
      machine_id: true,
      created_by: true,
      finished_by: true,
      status: true,
      priority: true,
      category: true,
      shift: true,
      problem_description: true,
      solution_description: true,
      started_at: true,
      finished_at: true,
      created_at: true,
      updated_at: true,
    };
  }

  private eventSelect() {
    return {
      id: true,
      maintenance_record_id: true,
      machine_id: true,
      component_name: true,
      event_type: true,
      event_date: true,
      used_part_description: true,
      quantity: true,
      removed_condition: true,
      destination: true,
      observation: true,
      photo_url: true,
      created_by: true,
      created_at: true,
    };
  }

  private photoSelect() {
    return {
      id: true,
      maintenance_record_id: true,
      type: true,
      file_url: true,
      created_by: true,
      created_at: true,
    };
  }
}
