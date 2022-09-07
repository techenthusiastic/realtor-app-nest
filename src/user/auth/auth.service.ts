import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

//
import { User, UserType } from '@prisma/client';

// Import bcryptjs
import * as bcrypt from 'bcryptjs';

// Import JWT
import * as jwt from 'jsonwebtoken';

// Import JWT Service
import { JwtService } from 'src/jwt/jwt.service';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const PRODUCT_KEY_SECRET = process.env.PRODUCT_KEY_SECRET;

// console.log('auth service', { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET });

interface SignUpParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SignInParams {
  email: string;
  password: string;
}

interface GenerateProductKeyParams {
  email: string;
  userType: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateAccessToken(payload: object) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        JWT_ACCESS_SECRET,
        {
          //   expiresIn: '15s',
        },
        (err, access_Token) => {
          if (err || !access_Token) reject(err);
          else resolve(access_Token);
        },
      );
    });
  }

  async signUp(
    userType: UserType,
    { name, phone, email, password }: SignUpParams,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (userExists)
      throw new ConflictException('User already exists with this email.');
    else {
      const hasedPassword = await bcrypt.hash(password, 10);
      const createUser = await this.prismaService.user.create({
        data: {
          name,
          phone,
          email,
          password: hasedPassword,
          user_type: userType,
        },
      });

      const jwt_token = await this.generateAccessToken({
        name,
        email,
        id: createUser.id,
        userType,
      });
      return { token: jwt_token };
    }
  }

  async signIn({ email, password }: SignInParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!userExists) throw new NotFoundException('User not Found');
    else {
      const pswdVerify = await bcrypt.compare(password, userExists.password);
      if (!pswdVerify) throw new ConflictException('Invalid Password');

      const jwt_token = await this.generateAccessToken({
        name: userExists.name,
        email,
        id: userExists.id,
        userType: userExists.user_type,
      });

      return { token: jwt_token };
    }
  }

  async generateProductKey({ email, userType }: GenerateProductKeyParams) {
    const string = `${email}-${userType}-${PRODUCT_KEY_SECRET}`;
    const hasedString = await bcrypt.hash(string, 10);
    return hasedString;
  }
}
