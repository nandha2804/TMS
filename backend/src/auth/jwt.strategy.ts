import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    try {
      console.log('Validating JWT payload:', { sub: payload.sub, email: payload.email });

      if (!payload.sub || !payload.email || !payload.role) {
        console.error('Invalid token payload:', payload);
        throw new UnauthorizedException('Invalid token structure');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        console.error('User not found for sub:', payload.sub);
        throw new UnauthorizedException('User not found');
      }

      // Verify payload matches user data
      if (user.email !== payload.email || user.role !== payload.role) {
        console.error('Token payload mismatch:', {
          expectedEmail: user.email,
          tokenEmail: payload.email,
          expectedRole: user.role,
          tokenRole: payload.role
        });
        throw new UnauthorizedException('Invalid token data');
      }

      console.log('User validated successfully:', { id: user._id, email: user.email });
      return user;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}