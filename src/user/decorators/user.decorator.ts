import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from '@prisma/client';

export interface UserInfo {
  name: string;
  email: string;
  id: number;
  userType: UserType;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
