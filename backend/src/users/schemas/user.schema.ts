import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Base interface for user data
export interface UserData {
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

// Interface for client-side response
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

// Full user data including database fields
export interface UserWithPassword extends UserData {
  _id: Types.ObjectId;
  password: string;
}

// Mongoose document type
export type UserDocument = UserWithPassword & Document;

@Schema()
export class User implements UserWithPassword {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  })
  email: string;

  @Prop({
    required: true,
    validate: {
      validator: function(v: string) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    }
  })
  password: string;

  @Prop({
    required: true,
    validate: {
      validator: function(v: string) {
        return v.length >= 2;
      },
      message: 'Name must be at least 2 characters long'
    }
  })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
    message: '{VALUE} is not a valid role'
  })
  role: string;
}

// Helper function to convert database user to response format
export function toUserResponse(user: UserWithPassword): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add transforms for JSON and Object conversion
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Add indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1 });

// Add error handling for duplicate key error
UserSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});