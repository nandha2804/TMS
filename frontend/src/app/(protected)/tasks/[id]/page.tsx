import { Metadata } from 'next';
import TaskDetailClient from './TaskDetail';

export const metadata: Metadata = {
  title: 'Task Detail',
};

type Props = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function TaskDetailPage({ params }: Props) {
  return <TaskDetailClient id={params.id} />;
}