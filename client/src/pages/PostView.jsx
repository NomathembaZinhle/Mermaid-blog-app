import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchPost, deletePost } from '../services/api';

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, loading, error } = useApi(() => fetchPost(id), true);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p>Error loading post: {error.message}</p>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        navigate('/');
      } catch (err) {
        alert('Failed to delete post: ' + err.message);
      }
    }
  };

  return (
    <article>
      <h2>{post.title}</h2>
      <p><em>Category: {post.category?.name}</em></p>
      <p><strong>Author:</strong> {post.author}</p>
      <div>{post.content}</div>

      <div style={{ marginTop: '1rem' }}>
        <Link to={`/posts/${id}/edit`} style={{ marginRight: '1rem' }}>
          Edit
        </Link>
        <button onClick={handleDelete} style={{ color: 'red' }}>
          Delete
        </button>
      </div>
    </article>
  );
}
