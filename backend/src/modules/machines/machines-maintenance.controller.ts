import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MachinesMaintenanceService } from './machines-maintenance.service';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance-record.dto';
import { FinishMaintenanceRecordDto } from './dto/finish-maintenance-record.dto';
import { ListMaintenanceRecordsQueryDto } from './dto/list-maintenance-records.dto';
import { CreateMaintenanceEventDto } from './dto/create-maintenance-event.dto';
import { CreateMaintenancePhotoDto } from './dto/create-maintenance-photo.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintenance-record.dto';

@ApiTags('machines')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('machines/:machineId/maintenance-records')
export class MachinesMaintenanceController {
  constructor(private readonly maintenance: MachinesMaintenanceService) {}

  @Post()
  createRecord(
    @Req() req: any,
    @Param('machineId') machineId: string,
    @Body() dto: CreateMaintenanceRecordDto,
  ) {
    const createdBy = this.parseId(req.user.sub);
    return this.maintenance.createRecord(
      this.parseId(machineId),
      dto,
      createdBy,
    );
  }

  @Get()
  listRecords(
    @Param('machineId') machineId: string,
    @Query() query: ListMaintenanceRecordsQueryDto,
  ) {
    return this.maintenance.listRecords(this.parseId(machineId), query);
  }

  @Get(':recordId')
  findRecord(
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.maintenance.findRecord(
      this.parseId(machineId),
      this.parseId(recordId),
    );
  }

  @Patch(':recordId')
  updateRecord(
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateMaintenanceRecordDto,
  ) {
    return this.maintenance.updateRecord(
      this.parseId(machineId),
      this.parseId(recordId),
      dto,
    );
  }

  @Patch(':recordId/finish')
  finishRecord(
    @Req() req: any,
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
    @Body() dto: FinishMaintenanceRecordDto,
  ) {
    const finishedBy = this.parseId(req.user.sub);
    return this.maintenance.finishRecord(
      this.parseId(machineId),
      this.parseId(recordId),
      dto,
      finishedBy,
    );
  }

  @Post(':recordId/events')
  createEvent(
    @Req() req: any,
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
    @Body() dto: CreateMaintenanceEventDto,
  ) {
    const createdBy = this.parseId(req.user.sub);
    return this.maintenance.createEvent(
      this.parseId(machineId),
      this.parseId(recordId),
      dto,
      createdBy,
    );
  }

  @Post(':recordId/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  createPhoto(
    @Req() req: any,
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
    @Body() dto: CreateMaintenancePhotoDto,
    @UploadedFile() file?: UploadedFile,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Arquivo inválido');
    }

    const createdBy = this.parseId(req.user.sub);
    return this.maintenance.createPhoto(
      this.parseId(machineId),
      this.parseId(recordId),
      dto,
      file,
      createdBy,
    );
  }

  @Get(':recordId/photos')
  listPhotos(
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.maintenance.listPhotos(
      this.parseId(machineId),
      this.parseId(recordId),
    );
  }

  @Delete(':recordId/photos/:photoId')
  removePhoto(
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.maintenance.removePhoto(
      this.parseId(machineId),
      this.parseId(recordId),
      this.parseId(photoId),
    );
  }

  @Get(':recordId/events')
  listEvents(
    @Param('machineId') machineId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.maintenance.listEvents(
      this.parseId(machineId),
      this.parseId(recordId),
    );
  }

  private parseId(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('ID inválido');
    }
  }
}
