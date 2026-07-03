import { FeedList } from '@/components/feed/feed-list';
import { mockPosts } from '@/lib/mock-data';

export default function FeedPage() {
  return (
    <div>
      <FeedList initialPosts={mockPosts} />
    </div>
  );
}
