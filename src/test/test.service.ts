import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { HomeResponseDTO } from 'src/dtos/home.dtos';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prismaService: PrismaService) {}

  async createHome() {
    const {
      address,
      numberOfBedrooms,
      numberOfBathrooms,
      city,
      price,
      landSize,
      propertyType,
      images,
    } = {
      address: 'VALID_ADDRESS',
      numberOfBedrooms: 43,
      numberOfBathrooms: 43.5,
      city: 'LSMD',
      price: 6000,
      landSize: 43,
      propertyType: PropertyType.CONDO,
      images: [
        {
          url: 'img1',
        },
        {
          url: 'img2',
        },
        {
          url: 'img3',
        },
      ],
    };
    const user = {
      name: 'VALID_NAME',
      email: 'mail123@gmail.com',
      id: 2,
      userType: 'REALTOR',
      iat: 1659031190,
    };

    try {
      const createHome = await this.prismaService.home.create({
        data: {
          address,
          number_of_bedrooms: numberOfBedrooms,
          number_of_bathrooms: numberOfBathrooms,
          city,
          price,
          land_size: landSize,
          propertyType,
          realtor_id: user.id,
        },
      });
      const homeImages = images.map((eachImage) => {
        return { ...eachImage, home_id: createHome.id };
      });
      await this.prismaService.image.createMany({
        data: homeImages,
      });
      createHome['Image'] = images.map((eachImage) => {
        return { url: eachImage.url };
      });
      return new HomeResponseDTO(createHome);
    } catch (error) {
      if (error.code === 'P2003') throw new ConflictException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getHomeById(id: number) {
    console.log('getHomeById-Service');
    console.log({ id });
    return this.prismaService.home.findUnique({ where: { id } });
  }
}
