import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

// Import JWT
import * as jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';

export class UserInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (authorization) {
      const token = authorization.split(' ')[1];
      try {
        const user = jwt.verify(token, JWT_ACCESS_SECRET);
        request.user = user;
      } catch (error) {
        // console.log('src/user/interceptors/user.interceptor.ts', error);
        throw new ForbiddenException('Invalid JWT Token');
      }
    }
    return next.handle();
  }
}
