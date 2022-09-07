import {
  Controller,
  Post,
  // Decorator
  Param,
  Body,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';

import { UserType } from '@prisma/client';

// Import DTOs
import {
  SignUpDTO,
  SignInDTO,
  GenerateProductKeyDTO,
} from 'src/dtos/auth.dtos';

//
import { AuthService } from './auth.service';

// Import bcryptjs
import * as bcrypt from 'bcryptjs';
import { User, UserInfo } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:userType')
  async signUp(
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
    @Body() body: SignUpDTO,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) throw new UnauthorizedException();
      // Verify the received product key
      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );
      if (!isValidProductKey)
        throw new UnauthorizedException('Invalid Product Key');
    }
    return this.authService.signUp(userType, body);
  }

  @Post('signin')
  signIn(@Body() body: SignInDTO) {
    return this.authService.signIn(body);
  }

  @Post('key')
  generateProductKey(@Body() body: GenerateProductKeyDTO) {
    return this.authService.generateProductKey(body);
  }

  @Get('/who-am-i')
  knowWhoAmI(@User() user: UserInfo) {
    return user;
  }
}
