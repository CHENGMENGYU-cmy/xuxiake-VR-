import { redirect } from 'next/navigation';

export default function DiarySquarePage() {
  redirect('/discover?tab=diary');
}
