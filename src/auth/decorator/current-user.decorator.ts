import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayLoad } from '../types/jwt-payload.type';
import { RequestWithUser } from '../types/request-with-user.type';

export const CurrentUser = createParamDecorator(
  <K extends keyof JWTPayLoad = keyof JWTPayLoad>(
    data: K | undefined,
    context: ExecutionContext,
  ): JWTPayLoad | JWTPayLoad[K] => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return data ? request.user[data] : request.user;
  },
);
