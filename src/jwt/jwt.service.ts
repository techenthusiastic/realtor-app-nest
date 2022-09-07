import { Injectable } from '@nestjs/common';

// Import JWT
import * as jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

// console.log('jwt-service', { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET });

@Injectable()
export class JwtService {
  generateAccessToken(payload: object) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        JWT_ACCESS_SECRET,
        {
          // expiresIn: "15s",
        },
        (err, access_Token) => {
          if (err || !access_Token) reject(err);
          else resolve(access_Token);
        },
      );
    });
  }

  generateRefreshToken(payload: object) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        JWT_REFRESH_SECRET,
        {
          // expiresIn: "15s",
        },
        (err, refresh_Token) => {
          if (err || !refresh_Token) reject(err);
          else resolve(refresh_Token);
        },
      );
    });
  }
}
