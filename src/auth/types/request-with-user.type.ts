import { Request } from 'express';
import { JWTPayLoad } from './jwt-payload.type';

export interface RequestWithUser extends Request {
  user: JWTPayLoad;
}
