import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config(); // Load environment variables

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/task-management';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('tasks').deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await db.collection('users').insertOne({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      createdAt: new Date(),
    });

    // Create sample tasks
    const tasks = [
      {
        title: 'Set up project infrastructure',
        description: 'Set up development environment and initial project structure',
        status: 'completed',
        priority: 'high',
        creator: admin.insertedId,
        assignee: admin.insertedId,
        dueDate: new Date('2025-06-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
        isRecurring: false,
      },
      {
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        status: 'in_progress',
        priority: 'high',
        creator: admin.insertedId,
        assignee: user.insertedId,
        dueDate: new Date('2025-06-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
        isRecurring: false,
      },
      {
        title: 'Design database schema',
        description: 'Create MongoDB schema for users and tasks',
        status: 'todo',
        priority: 'medium',
        creator: user.insertedId,
        assignee: admin.insertedId,
        dueDate: new Date('2025-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
        isRecurring: false,
      },
      {
        title: 'Weekly team meeting',
        description: 'Regular team sync-up meeting',
        status: 'todo',
        priority: 'medium',
        creator: admin.insertedId,
        assignee: user.insertedId,
        dueDate: new Date('2025-06-07'),
        createdAt: new Date(),
        updatedAt: new Date(),
        isRecurring: true,
        recurrencePattern: 'weekly',
      },
    ];

    await db.collection('tasks').insertMany(tasks);

    console.log('Seed data inserted successfully');
    console.log('\nTest Accounts:');
    console.log('Admin - Email: admin@example.com, Password: admin123');
    console.log('User - Email: user@example.com, Password: user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seed().catch(console.error);