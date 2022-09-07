import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType, UserType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/decorators/user.decorator';
import { homeSelect, HomeService } from './home.service';

const mockGetAllHomes = [
    {
      id: 1,
      address: 'HOME ADD 1',
      city: 'LSMD',
      price: 34000,
      propertyType: PropertyType.CONDO,
      numberOfBedrooms: 43,
      numberOfBathrooms: 43.5,
      landSize: 43,
      images: ['img4', 'img8'],
    },
    {
      id: 2,
      address: 'HOME ADD 2',
      city: 'SPER',
      price: 70000,
      propertyType: PropertyType.RESIDENTIAL,
      numberOfBedrooms: 4,
      numberOfBathrooms: 4.5,
      landSize: 453,
      images: ['img3', 'img6'],
    },
    {
      id: 3,
      address: 'HOME ADD 3',
      city: 'LSMD',
      price: 27000,
      propertyType: PropertyType.CONDO,
      numberOfBedrooms: 43,
      numberOfBathrooms: 43.5,
      landSize: 43,
      images: [],
    },
  ],
  mockCreateHome = {
    id: 4,
    address: 'HOME ADD 2',
    city: 'SPER',
    price: 60000,
    propertyType: PropertyType.RESIDENTIAL,
    numberOfBedrooms: 6,
    numberOfBathrooms: 4.5,
    landSize: 43,
    images: ['img5', 'img8'],
  },
  mockCreateManyImage = [{ url: 'img10' }, { url: 'img11' }, { url: 'img12' }];

describe('HomeService', () => {
  let service: HomeService, prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        // PrismaService,
        // Mock prismaService
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetAllHomes),
              create: jest.fn().mockReturnValue(mockCreateHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockCreateManyImage),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllHomes', () => {
    const filters = {
      city: 'HOME ADD 2',
      price: { gte: 30000, lte: 70000 },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct params', async () => {
      // Mock HomeService's getAllHomes function
      const mockPrismaHomeFindMany = jest.fn().mockReturnValue(mockGetAllHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaHomeFindMany);

      await service.getAllHomes(filters);

      expect(mockPrismaHomeFindMany).toBeCalledWith({
        select: homeSelect,
        where: filters,
      });
    });

    it('should throw not found exception when no homes found', async () => {
      const mockPrismaHomeFindMany = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaHomeFindMany);

      await expect(service.getAllHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeBody = {
      address: 'dfr 345s Inkrdso',
      numberOfBedrooms: 43,
      numberOfBathrooms: 43.5,
      city: 'LSMD',
      price: 6000,
      landSize: 43,
      propertyType: PropertyType.CONDO,
      images: [
        {
          url: 'img10',
        },
        {
          url: 'img11',
        },
        {
          url: 'img12',
        },
      ],
    };

    const mockUserInfo: UserInfo = {
      name: 'Sachin Km',
      email: 'sinha1abc@gmail.com',
      id: 4,
      userType: UserType.REALTOR,
      iat: 23423234,
      exp: 32432423423,
    };

    it('should call prisma.home.create with correct payload', async () => {
      const mockPrismaHomeCreate = jest.fn().mockReturnValue(mockCreateHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockPrismaHomeCreate);

      await service.createHome(mockCreateHomeBody, mockUserInfo);

      expect(mockPrismaHomeCreate).toBeCalledWith({
        data: {
          address: mockCreateHomeBody.address,
          number_of_bedrooms: mockCreateHomeBody.numberOfBedrooms,
          number_of_bathrooms: mockCreateHomeBody.numberOfBathrooms,
          city: mockCreateHomeBody.city,
          price: mockCreateHomeBody.price,
          land_size: mockCreateHomeBody.landSize,
          propertyType: mockCreateHomeBody.propertyType,
          realtor_id: mockUserInfo.id,
        },
      });
    });

    it('should call prisma.image.createMany with correct payload', async () => {
      const mockPrismaImageCreateMany = jest
        .fn()
        .mockReturnValue(mockCreateManyImage);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockPrismaImageCreateMany);

      await service.createHome(mockCreateHomeBody, mockUserInfo);

      const expectedData = mockCreateManyImage.map((eachImage) => {
        return { ...eachImage, home_id: 4 };
      });

      expect(mockPrismaImageCreateMany).toBeCalledWith({ data: expectedData });
    });
  });
});
