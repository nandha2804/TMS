import TaskDetailClient from './TaskDetail';

interface TaskDetailPageProps {
  params: { id: string };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  return <TaskDetailClient id={params.id} />;
}