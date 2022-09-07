import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController', () => {
  let controller: HomeController, service: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        // Mock HomeService
        {
          provide: HomeService,
          useValue: { getAllHomes: jest.fn().mockReturnValue([]) },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    service = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllHomes Controller', () => {
    it('should construct filters object correctly', async () => {
      // Mock the getAllHomes Service Method
      const mockGetHomeService = jest.fn().mockReturnValue([]);

      // Attach the mocked function to homeService's getAllHomes method
      jest.spyOn(service, 'getAllHomes').mockImplementation(mockGetHomeService);

      await controller.getAllHomes(
        'ADD 1',
        '50000',
        undefined,
        PropertyType.RESIDENTIAL,
      );

      expect(mockGetHomeService).toBeCalledWith({
        city: 'ADD 1',
        price: { gte: 50000 },
        propertyType: 'RESIDENTIAL',
      });
    });
  });
});
