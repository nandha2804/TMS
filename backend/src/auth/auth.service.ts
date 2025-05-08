import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UserResponse, UserWithPassword, toUserResponse } from '../users/schemas/user.schema';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
  private tokenBlacklist = new Set<string>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    setInterval(() => this.clearOldLoginAttempts(), 3600000);
  }

  private clearOldLoginAttempts() {
    const oneHourAgo = Date.now() - 3600000;
    for (const [email, data] of this.loginAttempts) {
      if (data.firstAttempt < oneHourAgo) {
        this.loginAttempts.delete(email);
      }
    }
  }

  private checkLoginAttempts(email: string): { count: number; firstAttempt: number } {
    const attempts = this.loginAttempts.get(email) || { count: 0, firstAttempt: Date.now() };
    if (attempts.count >= 5) {
      const timeSinceFirst = Date.now() - attempts.firstAttempt;
      if (timeSinceFirst < 3600000) { // 1 hour
        throw new UnauthorizedException('Too many login attempts. Please try again later.');
      }
      // Reset attempts after timeout
      this.loginAttempts.delete(email);
      return { count: 0, firstAttempt: Date.now() };
    }
    return attempts;
  }

  async register(email: string, password: string, name: string): Promise<TokenResponse> {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const user = await this.usersService.create(email, password, name);
      console.log('User registered successfully:', { email, name });
      return this.generateToken(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      email = email.toLowerCase().trim();
      console.log('Login attempt for:', email);

      // Check login attempts
      const attempts = this.checkLoginAttempts(email);
      
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        await this.handleFailedLogin(email, attempts);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(email, attempts);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset login attempts on successful login
      this.loginAttempts.delete(email);
      return this.generateToken(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async handleFailedLogin(email: string, attempts: { count: number; firstAttempt: number }) {
    attempts.count++;
    this.loginAttempts.set(email, attempts);
    console.warn(`Failed login attempt for ${email}. Attempt ${attempts.count}`);
  }

  private generateToken(user: UserWithPassword): TokenResponse {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString() },
      { 
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_SECRET'),
      }
    );

    console.log('Tokens generated for user:', { email: user.email, id: user._id });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: toUserResponse(user)
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      // Verify the token isn't blacklisted
      if (this.tokenBlacklist.has(refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Add the used refresh token to blacklist
      this.tokenBlacklist.add(refreshToken);

      const newAccessToken = this.jwtService.sign(
        {
          email: user.email,
          sub: user._id.toString(),
          role: user.role,
        },
        {
          expiresIn: '15m',
          secret: this.configService.get<string>('JWT_SECRET'),
        }
      );

      return { access_token: newAccessToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}