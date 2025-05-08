import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserResponse, UserWithPassword, UserData, toUserResponse } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private configService: ConfigService
  ) {}

  async create(email: string, password: string, name: string): Promise<UserWithPassword> {
    try {
      // Normalize email and name
      email = email.toLowerCase().trim();
      name = name.trim();

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestException('Please provide a valid email address');
      }

      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Validate password strength
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password)) {
        throw new BadRequestException(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
        );
      }

      // Validate name length
      if (name.length < 2) {
        throw new BadRequestException('Name must be at least 2 characters long');
      }

      // Rate limit password hashing
      const startTime = Date.now();
      const saltRounds = this.configService.get<string>('NODE_ENV') === 'production' ? 12 : 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const hashTime = Date.now() - startTime;
      
      // Log if hashing takes too long (potential DoS vector)
      if (hashTime > 1000) {
        console.warn(`Password hashing took ${hashTime}ms, which is unusually long`);
      }

      // Create new user with explicit role
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        role: 'user' // Explicitly set role to prevent role injection
      });

      console.log('Creating new user:', { email, name });
      const savedUser = await newUser.save();
      console.log('User created successfully:', { id: savedUser._id, email: savedUser.email });

      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      // Convert Mongoose validation errors to BadRequestException
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      email = email.toLowerCase().trim();
      console.log('Finding user by email:', email);
      const user = await this.userModel.findOne({ email });
      console.log('User found:', user ? { id: user._id, email: user.email } : 'null');
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<UserWithPassword | null> {
    console.log('Finding user by id:', id);
    if (!Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format');
      throw new NotFoundException('User not found');
    }
    const user = await this.userModel.findById(new Types.ObjectId(id));
    console.log('Found user:', user ? { id: user._id, email: user.email } : 'null');
    return user;
  }

  async findAll(): Promise<UserResponse[]> {
    try {
      console.log('Fetching all users');
      const users = await this.userModel.find();
      console.log(`Found ${users.length} users`);
      return users.map(toUserResponse);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}