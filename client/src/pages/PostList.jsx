import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchPosts } from '../services/api';

export default function PostList() {
  const { data: posts, loading, error } = useApi(fetchPosts);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div>
      <h2>Blog Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}
      <ul>
        {posts.map(post => (
          <li key={post._id}>
            <Link to={`/posts/${post._id}`}>
              {post.title} <em>({post.category?.name || 'Uncategorized'})</em>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
