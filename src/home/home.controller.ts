import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  //
  Param,
  Body,
  // Parse
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { HomeService } from './home.service';

// Import DTOs
import {
  CreateHomeDTO,
  HomeResponseDTO,
  UpdateHomeDTO,
} from './../dtos/home.dtos';
import { PropertyType, UserType } from '@prisma/client';
import { User, UserInfo } from 'src/user/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getAllHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDTO[]> {
    const priceFilter =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;
    const filters = {
      ...(city && { city }),
      ...(priceFilter && { price: priceFilter }),
      ...(propertyType && { propertyType }),
    };
    return this.homeService.getAllHomes(filters);
  }

  @Get(':id')
  getHomeById(@Param('id') id: number): Promise<HomeResponseDTO> {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Post()
  createHome(
    @Body()
    body: CreateHomeDTO,
    @User() user: UserInfo,
  ) {
    // return { body };
    return this.homeService.createHome(body, user);
  }

  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDTO,
    @User() user: UserInfo,
  ): Promise<HomeResponseDTO> {
    return this.homeService.updateHome(id, body, user);
  }

  @Delete('/:id')
  deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInfo,
  ): Promise<HomeResponseDTO> {
    return this.homeService.deleteHome(id, user);
  }
}
