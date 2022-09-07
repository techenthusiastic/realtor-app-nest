import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { HomeResponseDTO } from 'src/dtos/home.dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from 'src/user/decorators/user.decorator';

// Import uuid
// import { v4 as uuidV4 } from 'uuid';

interface GetAllHomes {
  city?: string;
  price?: { gte?: number; lte?: number };
  propertyType?: PropertyType;
}

interface CreateHomeBodyParam {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeBodyParam {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  number_of_bedrooms: true,
  number_of_bathrooms: true,
  city: true,
  price: true,
  land_size: true,
  propertyType: true,
  Image: { select: { url: true } },
};

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAllHomes(filters: GetAllHomes): Promise<HomeResponseDTO[]> {
    const allHomes = await this.prismaService.home.findMany({
      select: homeSelect,
      where: filters,
    });
    if (!allHomes.length) throw new NotFoundException();
    return allHomes.map((eachHome) => new HomeResponseDTO(eachHome));
  }

  async getHomeById(id: number): Promise<HomeResponseDTO> {
    const homeDetails = await this.prismaService.home.findUnique({
      select: homeSelect,
      where: { id },
    });
    if (!homeDetails)
      throw new NotFoundException('No Home Exists with this ID');
    return new HomeResponseDTO(homeDetails);
  }

  async createHome(
    {
      address,
      numberOfBedrooms,
      numberOfBathrooms,
      city,
      price,
      landSize,
      propertyType,
      images,
    }: CreateHomeBodyParam,
    user: UserInfo,
  ): Promise<HomeResponseDTO> {
    console.log(user);
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

  private getRealtorById(id: number) {}

  async updateHome(
    id: number,
    {
      address,
      numberOfBedrooms,
      numberOfBathrooms,
      city,
      price,
      landSize,
      propertyType,
    }: UpdateHomeBodyParam,
    user: UserInfo,
  ): Promise<HomeResponseDTO> {
    const homeDetailsCurrent = await this.prismaService.home.findUnique({
      where: { id },
    });
    if (!homeDetailsCurrent)
      throw new NotFoundException('No home exists with this ID');
    else if (homeDetailsCurrent.realtor_id !== user.id)
      throw new ForbiddenException('Home was added by some other realtor');
    // else proceed to update the new Data
    const newData = {
      ...homeDetailsCurrent,
      ...(address && { address }),
      ...(numberOfBedrooms && { number_of_bedrooms: numberOfBedrooms }),
      ...(numberOfBathrooms && { number_of_bathrooms: numberOfBathrooms }),
      ...(city && { city }),
      ...(price && { price }),
      ...(landSize && { land_size: landSize }),
      ...(propertyType && { propertyType }),
    };
    const updatedData = await this.prismaService.home.update({
      data: newData,
      where: { id },
    });
    updatedData['Image'] = [];
    return new HomeResponseDTO(updatedData);
  }

  async deleteHome(id: number, user: UserInfo): Promise<HomeResponseDTO> {
    const homeDetailsCurrent = await this.prismaService.home.findUnique({
      where: { id },
    });
    if (!homeDetailsCurrent)
      throw new NotFoundException('No home exists with this ID');
    else if (homeDetailsCurrent.realtor_id !== user.id)
      throw new ForbiddenException('Home was added by some other realtor');
    try {
      const deletedImages = await this.prismaService.image.deleteMany({
        where: { home_id: id },
      });
      const deletedData = await this.prismaService.home.delete({
        where: { id },
      });
      deletedData['Image'] = [
        {
          url: deletedImages.count
            ? 'All images were deleted'
            : 'No images was there to be deleted',
        },
      ];
      return new HomeResponseDTO(deletedData);
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('No Data exists with this ID');
      else throw new InternalServerErrorException(error.message);
    }
  }
}
