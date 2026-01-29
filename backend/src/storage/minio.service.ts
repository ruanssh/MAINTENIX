import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';

type UploadParams = {
  objectName: string;
  buffer: Buffer;
  contentType?: string;
};

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: MinioClient;
  private readonly bucket: string;
  private readonly region?: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpointRaw = config.get<string>('MINIO_ENDPOINT');
    if (!endpointRaw) throw new Error('MINIO_ENDPOINT não definido');

    const accessKey = config.get<string>('MINIO_ACCESS_KEY');
    if (!accessKey) throw new Error('MINIO_ACCESS_KEY não definido');

    const secretKey = config.get<string>('MINIO_SECRET_KEY');
    if (!secretKey) throw new Error('MINIO_SECRET_KEY não definido');

    const bucket = config.get<string>('MINIO_BUCKET');
    if (!bucket) throw new Error('MINIO_BUCKET não definido');

    const region = config.get<string>('MINIO_REGION');
    const useSslRaw = config.get<string>('MINIO_USE_SSL');
    const publicUrl = config.get<string>('MINIO_PUBLIC_URL');

    const hasProtocol = /^https?:\/\//i.test(endpointRaw);
    const endpointUrl = hasProtocol ? new URL(endpointRaw) : null;
    const useSSL =
      typeof useSslRaw === 'string'
        ? useSslRaw.toLowerCase() === 'true'
        : endpointUrl
          ? endpointUrl.protocol === 'https:'
          : false;

    const endPoint = endpointUrl ? endpointUrl.hostname : endpointRaw;
    const port = endpointUrl && endpointUrl.port ? Number(endpointUrl.port) : undefined;

    this.client = new MinioClient({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    const base = publicUrl ?? (endpointUrl ? endpointUrl.origin : endpointRaw);
    this.baseUrl = base.replace(/\/$/, '');
    this.bucket = bucket;
    this.region = region ?? undefined;
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, this.region);
    }
  }

  async upload(params: UploadParams) {
    const meta = params.contentType
      ? { 'Content-Type': params.contentType }
      : undefined;

    await this.client.putObject(
      this.bucket,
      params.objectName,
      params.buffer,
      params.buffer.length,
      meta,
    );

    return this.getPublicUrl(params.objectName);
  }

  async removeByUrl(fileUrl: string) {
    const prefix = `${this.baseUrl}/${this.bucket}/`;
    if (!fileUrl.startsWith(prefix)) return;

    const objectName = fileUrl.slice(prefix.length);
    if (!objectName) return;

    await this.client.removeObject(this.bucket, objectName);
  }

  getPublicUrl(objectName: string) {
    return `${this.baseUrl}/${this.bucket}/${objectName}`;
  }
}
