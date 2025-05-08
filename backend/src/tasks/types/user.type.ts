import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type UserDocument = User & Document;