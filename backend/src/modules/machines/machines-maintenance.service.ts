import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMaintenanceRecordDto,
  MaintenanceRecordPriority,
} from './dto/create-maintenance-record.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintenance-record.dto';
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
import { MailService } from '../mail/mail.service';
type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class MachinesMaintenanceService {
  private readonly logger = new Logger(MachinesMaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async createRecord(
    machineId: bigint,
    dto: CreateMaintenanceRecordDto,
    createdBy: bigint,
  ) {
    await this.ensureMachine(machineId);
    const responsibleId = this.parseBigInt(dto.responsible_id);
    await this.ensureActiveUser(responsibleId);

    const record = await this.prisma.maintenance_records.create({
      data: {
        machine_id: machineId,
        created_by: createdBy,
        responsible_id: responsibleId,
        status: 'PENDING',
        priority: dto.priority ?? MaintenanceRecordPriority.MEDIUM,
        category: dto.category,
        shift: dto.shift,
        problem_description: dto.problem_description,
        started_at: dto.started_at ? new Date(dto.started_at) : null,
      },
      select: this.recordSelect(),
    });

    await this.notifyResponsibleAssignment(record.id);

    return record;
  }

  async listRecords(machineId: bigint, query: ListMaintenanceRecordsQueryDto) {
    await this.ensureMachine(machineId);

    const responsibleId = query.responsible_id
      ? this.parseBigInt(query.responsible_id)
      : undefined;

    const searchQuery = query.query?.trim();

    return this.prisma.maintenance_records.findMany({
      where: {
        machine_id: machineId,
        status: query.status,
        priority: query.priority,
        category: query.category,
        shift: query.shift,
        responsible_id: responsibleId,
        problem_description: searchQuery
          ? { contains: searchQuery }
          : undefined,
      },
      orderBy: { created_at: 'desc' },
      select: this.recordSelect(),
    });
  }

  async listAllRecords(query: ListMaintenanceRecordsQueryDto) {
    const responsibleId = query.responsible_id
      ? this.parseBigInt(query.responsible_id)
      : undefined;
    const machineId = query.machine_id
      ? this.parseBigInt(query.machine_id)
      : undefined;
    const searchQuery = query.query?.trim();

    return this.prisma.maintenance_records.findMany({
      where: {
        status: query.status,
        priority: query.priority,
        category: query.category,
        shift: query.shift,
        responsible_id: responsibleId,
        machine_id: machineId,
        problem_description: searchQuery ? { contains: searchQuery } : undefined,
      },
      orderBy: { created_at: 'desc' },
      select: this.recordSelectWithMachine(),
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

  async updateRecord(
    machineId: bigint,
    recordId: bigint,
    dto: UpdateMaintenanceRecordDto,
  ) {
    const existing = await this.prisma.maintenance_records.findFirst({
      where: { id: recordId, machine_id: machineId },
    });
    if (!existing) throw new NotFoundException('Registro não encontrado');
    if (existing.status === 'DONE') {
      throw new BadRequestException('Registro já finalizado');
    }

    const responsibleId = dto.responsible_id
      ? this.parseBigInt(dto.responsible_id)
      : undefined;
    if (responsibleId) {
      await this.ensureActiveUser(responsibleId);
    }

    const data = {
      problem_description: dto.problem_description,
      priority: dto.priority,
      category: dto.category,
      shift: dto.shift,
      responsible_id: responsibleId,
      started_at: dto.started_at ? new Date(dto.started_at) : undefined,
    };

    const hasUpdates = Object.values(data).some((value) => value !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException('Nenhuma informação para atualizar');
    }

    const shouldNotifyResponsible =
      responsibleId !== undefined && responsibleId !== existing.responsible_id;

    const record = await this.prisma.maintenance_records.update({
      where: { id: recordId },
      data: {
        ...data,
        updated_at: new Date(),
      },
      select: this.recordSelect(),
    });

    if (shouldNotifyResponsible) {
      await this.notifyResponsibleAssignment(recordId);
    }

    return record;
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

  async removePhoto(machineId: bigint, recordId: bigint, photoId: bigint) {
    const record = await this.prisma.maintenance_records.findFirst({
      where: { id: recordId, machine_id: machineId },
      select: { id: true, status: true },
    });
    if (!record) throw new NotFoundException('Registro não encontrado');
    if (record.status === 'DONE') {
      throw new BadRequestException('Registro já finalizado');
    }

    const photo = await this.prisma.maintenance_photos.findFirst({
      where: { id: photoId, maintenance_record_id: recordId },
    });
    if (!photo) throw new NotFoundException('Foto não encontrada');

    try {
      await this.storage.removeByUrl(photo.file_url);
    } catch {
      // ignore storage errors to avoid blocking DB cleanup
    }

    return this.prisma.maintenance_photos.delete({
      where: { id: photoId },
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

  private async ensureActiveUser(userId: bigint) {
    const exists = await this.prisma.users.findFirst({
      where: { id: userId, active: true },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Responsável não encontrado');
  }

  private parseBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('Responsável inválido');
    }
  }

  private recordSelect() {
    return {
      id: true,
      machine_id: true,
      created_by: true,
      finished_by: true,
      responsible_id: true,
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

  private recordSelectWithMachine() {
    return {
      ...this.recordSelect(),
      machines: {
        select: { id: true, name: true },
      },
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

  private async notifyResponsibleAssignment(recordId: bigint) {
    try {
      const record = await this.prisma.maintenance_records.findUnique({
        where: { id: recordId },
        select: {
          id: true,
          machine_id: true,
          problem_description: true,
          priority: true,
          category: true,
          shift: true,
          machines: { select: { name: true } },
          users_maintenance_records_responsible_idTousers: {
            select: { name: true, email: true },
          },
        },
      });

      if (!record) return;

      const responsible =
        record.users_maintenance_records_responsible_idTousers;
      if (!responsible?.email) return;

      const actionUrl = this.buildRecordUrl(record.machine_id, record.id);

      await this.mail.sendMaintenanceAssignmentEmail({
        to: responsible.email,
        name: responsible.name,
        machineName: record.machines?.name ?? 'Máquina',
        priority: this.formatPriority(record.priority),
        category: this.formatCategory(record.category),
        shift: this.formatShift(record.shift),
        problemDescription: record.problem_description,
        actionUrl,
      });
    } catch (error) {
      this.logger.error(
        `Falha ao notificar responsavel no registro ${recordId}`,
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  private buildRecordUrl(machineId: bigint, recordId: bigint) {
    const baseUrl =
      this.config.get<string>('MAIL_APP_URL') ?? 'http://localhost:5173';
    return `${baseUrl}/machines/${machineId.toString()}/maintenance-records/${recordId.toString()}`;
  }

  private formatPriority(value: string | null | undefined) {
    return this.lookupLabel(value, {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
    });
  }

  private formatCategory(value: string | null | undefined) {
    return this.lookupLabel(value, {
      ELETRICA: 'Elétrica',
      MECANICA: 'Mecânica',
      PNEUMATICA: 'Pneumática',
      PROCESSO: 'Processo',
      ELETRONICA: 'Eletrônica',
      AUTOMACAO: 'Automação',
      PREDIAL: 'Predial',
      FERRAMENTARIA: 'Ferramentaria',
      REFRIGERACAO: 'Refrigeração',
      SETUP: 'Setup',
      HIDRAULICA: 'Hidráulica',
    });
  }

  private formatShift(value: string | null | undefined) {
    return this.lookupLabel(value, {
      PRIMEIRO: 'Primeiro',
      SEGUNDO: 'Segundo',
      TERCEIRO: 'Terceiro',
    });
  }

  private lookupLabel(
    value: string | null | undefined,
    mapping: Record<string, string>,
  ) {
    if (!value) return '-';
    const key = value.toUpperCase();
    if (mapping[key]) return mapping[key];
    const normalized = value.toLowerCase().replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
}
