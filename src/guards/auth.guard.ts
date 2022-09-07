import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

// Import JWT
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';

interface JwtPayload {
  name: string;
  email: string;
  id: number;
  userType: UserType;
  iat: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      //   context.getClass(),
    ]);
    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers.authorization;
      if (authorization) {
        const token = authorization.split(' ')[1];
        try {
          const user: JwtPayload = jwt.verify(
            token,
            JWT_ACCESS_SECRET,
          ) as JwtPayload;
          if (roles.includes(user.userType)) return true;
          else return false;
        } catch (error) {
          // console.log('src/user/interceptors/user.interceptor.ts', error);
          throw new ForbiddenException();
        }
      } else return false;
    } else return true;
  }
}
