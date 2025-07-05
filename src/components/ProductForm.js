import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Input,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Home as HomeIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

const BACKEND_URL = 'http://localhost:4000';

const ProductForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  });
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload to backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.url) {
        setFormData(prev => ({ ...prev, image: result.url }));
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.image
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Product created successfully!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Failed to add product');
      }
    } catch (err) {
      alert('Failed to add product');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create Product
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 440, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            Create Product Card
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Product Name *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 2, maxWidth: 400 }}
            />

            <TextField
              fullWidth
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              sx={{ mb: 2, maxWidth: 400 }}
            />

            <TextField
              fullWidth
              label="Price (₽) *"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2, maxWidth: 400 }}
            />

            <TextField
              fullWidth
              label="Image URL (or upload below) *"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              required
              sx={{ mb: 2, maxWidth: 400 }}
            />

            <Box sx={{ mb: 2, width: '100%', maxWidth: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{ mr: 2 }}
              >
                Upload Image
                <Input
                  type="file"
                  inputProps={{ accept: 'image/*' }}
                  onChange={handleImageUpload}
                  sx={{ display: 'none' }}
                />
              </Button>
              {uploading && <CircularProgress size={24} sx={{ ml: 1 }} />}
              {uploadError && (
                <Typography color="error" variant="body2" sx={{ ml: 2 }}>{uploadError}</Typography>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              sx={{ width: '100%', maxWidth: 400 }}
              disabled={uploading}
            >
              Create Product
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default ProductForm; 