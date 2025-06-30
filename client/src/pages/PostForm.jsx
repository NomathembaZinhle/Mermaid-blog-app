import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPost, createPost, updatePost, fetchCategories } from '../services/api';

export default function PostForm({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
  });

  const [loading, setLoading] = useState(editMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch categories on mount
    fetchCategories()
      .then(setCategories)
      .catch(err => setError(err));

    // If edit mode, load post data
    if (editMode && id) {
      fetchPost(id)
        .then(post => {
          setFormData({
            title: post.title,
            content: post.content,
            category: post.category?._id || '',
            author: post.author,
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }
  }, [editMode, id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Basic front-end validation
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError(new Error('All fields are required'));
      return;
    }

    try {
      if (editMode) {
        await updatePost(id, formData);
      } else {
        await createPost(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err);
    }
  };

  if (loading)
