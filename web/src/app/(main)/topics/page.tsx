import { redirect } from 'next/navigation';

export default function TopicsPage() {
  redirect('/discover?tab=topics');
}
