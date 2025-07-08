import { Test, TestingModule } from '@nestjs/testing';
import { ZipController } from '../src/zip/zip.controller';
import { EnhancedZipService } from '../src/zip/enhanced-zip.service';
import { ZipQueueService } from '../src/zip/queue/zip-queue.service';
import { DatahubService } from '../src/zip/datahub/datahub.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ZipController', () => {
  let controller: ZipController;
  let service: EnhancedZipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipController],
      providers: [
        {
          provide: EnhancedZipService,
          useValue: {
            archiveAndStreamZip: jest.fn(),
            getJobStatus: jest.fn(),
          },
        },
        {
          provide: ZipQueueService,
          useValue: {
            addZipJob: jest.fn(),
            getJobStatus: jest.fn(),
          },
        },
        {
          provide: DatahubService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ZipController>(ZipController);
    service = module.get<EnhancedZipService>(EnhancedZipService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle zip creation', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      headersSent: false,
    };
    const mockDto = {
      fileUrls: ['s3://bucket/file1.pdf'],
      zipFileName: 'test.zip',
    };

    jest.spyOn(service, 'archiveAndStreamZip').mockResolvedValue(undefined);

    await controller.createZip(mockDto, mockRes as any);

    expect(service.archiveAndStreamZip).toHaveBeenCalledWith(
      mockDto,
      mockRes,
      'default-user',
    );
  });
});
