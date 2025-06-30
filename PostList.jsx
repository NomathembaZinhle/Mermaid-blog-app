import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchPosts, deletePost } from '../services/api';
import { useState } from 'react';

export default function PostList() {
  const { data: posts, loading, error, execute } = useApi(fetchPosts);
  const [optimisticPosts, setOptimisticPosts] = useState([]);

  const handleDelete = async (id) => {
    const currentPosts = optimisticPosts.length ? optimisticPosts : posts;
    const updated = currentPosts.filter(post => post._id !== id);
    setOptimisticPosts(updated);

    try {
      await deletePost(id);
    } catch (err) {
      alert('Delete failed: ' + err.message);
      setOptimisticPosts(currentPosts); // rollback
    }
  };

  const list = optimisticPosts.length ? optimisticPosts : posts;

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <div>
      <h2>Blog Posts</h2>
      {list.length === 0 && <p>No posts found.</p>}
      <ul>
        {list.map(post => (
          <li key={post._id}>
            <Link to={`/posts/${post._id}`}>
              {post.title} <em>({post.category?.name || 'Uncategorized'})</em>
            </Link>
            {' '}
            <button onClick={() => handleDelete(post._id)} style={{ color: 'red', marginLeft: '1rem' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
