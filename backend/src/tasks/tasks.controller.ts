import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserDocument } from './types/user.type';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  findAll(@Query() query: {
    search?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    creator?: string;
    dueBefore?: string;
    dueAfter?: string;
    limit?: number;
  }) {
    const { limit, ...filters } = query;
    return this.tasksService.findAll({
      ...filters,
      dueBefore: query.dueBefore ? new Date(query.dueBefore) : undefined,
      dueAfter: query.dueAfter ? new Date(query.dueAfter) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user._id;
    return this.tasksService.getTaskStats(userId);
  }

  @Get('my-tasks')
  findMyTasks(@Request() req, @Query('type') type: 'created' | 'assigned' = 'assigned') {
    return this.tasksService.findUserTasks(req.user._id, type);
  }

  @Get('overdue')
  findOverdueTasks(@Request() req) {
    return this.tasksService.findOverdueTasks(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: Partial<CreateTaskDto>,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user);
  }
}