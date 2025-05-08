import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserDocument } from './types/user.type';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto, creator: UserDocument): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...createTaskDto,
      creator: creator._id,
    });
    return task.save();
  }

  async findAll(query: {
    search?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    creator?: string;
    dueBefore?: Date;
    dueAfter?: Date;
    limit?: number;
  }): Promise<TaskDocument[]> {
    const { limit, ...filter } = query;
    let taskQuery = this.taskModel.find(filter);

    if (query.search) {
      taskQuery = taskQuery.find({ $text: { $search: query.search } });
    }
    if (query.status) {
      taskQuery = taskQuery.find({ status: query.status });
    }
    if (query.priority) {
      taskQuery = taskQuery.find({ priority: query.priority });
    }
    if (query.assignee) {
      taskQuery = taskQuery.find({ assignee: query.assignee });
    }
    if (query.creator) {
      taskQuery = taskQuery.find({ creator: query.creator });
    }
    if (query.dueBefore || query.dueAfter) {
      const dateFilter: any = {};
      if (query.dueBefore) {
        dateFilter.$lte = new Date(query.dueBefore);
      }
      if (query.dueAfter) {
        dateFilter.$gte = new Date(query.dueAfter);
      }
      taskQuery = taskQuery.find({ dueDate: dateFilter });
    }

    if (limit) {
      taskQuery = taskQuery.limit(limit);
    }

    return taskQuery
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .exec();
    
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateData: Partial<CreateTaskDto>, user: UserDocument): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    // Only creator or assignee can update the task
    if (task.creator.toString() !== user._id.toString() && 
        task.assignee.toString() !== user._id.toString() &&
        user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return updatedTask;
  }

  async remove(id: string, user: UserDocument): Promise<void> {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    // Only creator or admin can delete the task
    if (task.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await task.deleteOne();
  }

  async findUserTasks(userId: string, type: 'created' | 'assigned'): Promise<TaskDocument[]> {
    const filter = type === 'created' ? { creator: userId } : { assignee: userId };
    return this.taskModel
      .find(filter)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOverdueTasks(userId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        assignee: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' }
      })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 })
      .exec();
  }

  async getTaskStats(userId: string) {
    const now = new Date();
    const [total, completed, inProgress, overdue] = await Promise.all([
      // Total tasks assigned to user
      this.taskModel.countDocuments({ assignee: userId }),
      // Completed tasks
      this.taskModel.countDocuments({
        assignee: userId,
        status: 'completed'
      }),
      // In progress tasks
      this.taskModel.countDocuments({
        assignee: userId,
        status: 'in_progress'
      }),
      // Overdue tasks (not completed and past due date)
      this.taskModel.countDocuments({
        assignee: userId,
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      })
    ]);

    return {
      total,
      completed,
      inProgress,
      overdue
    };
  }
}