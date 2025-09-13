import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

class JWTUtils {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '2h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry } as jwt.SignOptions
    );
  }

  generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions
    );
  }

  generateTokens(payload: Omit<TokenPayload, 'type'>): UserTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  refreshTokens(refreshToken: string): UserTokens {
    const decoded = this.verifyRefreshToken(refreshToken);
    const payload = {
      userId: decoded.userId,
      email: decoded.email
    };
    return this.generateTokens(payload);
  }

  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }
    return authHeader.substring(7);
  }
}

export const jwtUtils = new JWTUtils();