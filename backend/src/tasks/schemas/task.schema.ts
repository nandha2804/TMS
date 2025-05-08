import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type TaskDocument = Task & Document;

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignee: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ type: String })
  recurrencePattern?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Add indexes for efficient querying
TaskSchema.index({ title: 'text', description: 'text' }); // For text search
TaskSchema.index({ creator: 1, status: 1 }); // For filtering user's created tasks
TaskSchema.index({ assignee: 1, status: 1 }); // For filtering assigned tasks
TaskSchema.index({ dueDate: 1 }); // For due date queries