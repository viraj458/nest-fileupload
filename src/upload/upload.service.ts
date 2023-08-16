import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;

  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const { region } = this.getAwsConfig();

    this.s3 = new S3Client({
      region: region,
    });
  }

  async uploadFile(file: Buffer, fileName: string) {
    const key = `${uuid()}-${fileName}`;
    const { bucketName, region } = this.getAwsConfig();
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Body: file,
        Key: key,
      }),
    );

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    const fileStorageInDB = {
      fileName: fileName,
      fileUrl: url,
      key: key,
    };

    await this.prismaService.fileEntity.create({
      data: fileStorageInDB,
    });

    return { url };
  }

  private getAwsConfig = () => ({
    region: this.configService.get('AWS_S3_REGION'),
    bucketName: this.configService.get('AWS_BUCKET_NAME'),
  });
}
