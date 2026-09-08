import type { Blog } from '../../../api/blogs';
import { BlogCard } from './BlogCard';

interface BlogGridProps {
  blogs: Blog[];
  onViewImage: (imageUrl: string, title: string) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export function BlogGrid({ blogs, onViewImage, onEdit, onDelete }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onViewImage={onViewImage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default BlogGrid;
