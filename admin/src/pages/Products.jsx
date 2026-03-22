import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary, getCloudinaryUrl } from '../utils/storage-utils';
import { Package, Plus, Trash2, Loader2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    color: '',
    category: 'wet-grinders',
    desc: '',
    image: null
  });

  const categories = [
    { id: 'wet-grinders', name: 'Wet Grinders' },
    { id: 'mixer-grinders', name: 'Mixer Grinders' },
    { id: 'gas-stoves', name: 'Gas Stoves' },
    { id: 'spares', name: 'Spares' }
  ];

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      setError("Please select an image.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(formData.image, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      // 2. Save product to Firestore
      await addDoc(collection(db, 'products'), {
        name: formData.name,
        price: formData.price,
        quantity: formData.quantity,
        color: formData.color,
        category: formData.category,
        desc: formData.desc,
        image: imageUrl,
        createdAt: new Date().toISOString()
      });

      // Show success message
      setSuccess("Product added successfully!");
      
      // Reset form and hide after delay
      setFormData({
        name: '',
        price: '',
        quantity: '',
        color: '',
        category: 'wet-grinders',
        desc: '',
        image: null
      });
      
      setTimeout(() => {
        setSuccess(null);
        setShowAddForm(false);
      }, 3000);

    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || "Failed to add product. Please check your connection.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setSuccess("Product deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product.");
      }
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Product Management</h1>
          <p>Total Products: {products.length} <span style={{fontSize: '10px', opacity: 0.5}}>(v1.1)</span></p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setSuccess(null);
          }}
          className="add-product-btn"
        >
          {showAddForm ? 'Cancel' : (
            <>
              <Plus size={18} />
              <span>Add New Product</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-alert-banner">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {showAddForm && (
        <div className="add-product-card">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Amirthaa Ace White" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <Input 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  placeholder="e.g. ₹6,500" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <Input 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 50" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <Input 
                  name="color" 
                  value={formData.color} 
                  onChange={handleInputChange} 
                  placeholder="e.g. White" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange}
                  className="category-select"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <Input 
                  name="desc" 
                  value={formData.desc} 
                  onChange={handleInputChange} 
                  placeholder="Brief description of the product" 
                  required 
                />
              </div>
              <div className="form-group full-width">
                <label>Product Image</label>
                <div className="file-upload-container">
                  <input 
                    type="file" 
                    id="product-image" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="file-input"
                    required
                  />
                  <label htmlFor="product-image" className="file-label">
                    <Upload size={20} />
                    <span>{formData.image ? formData.image.name : 'Choose an image from your system'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={uploading}
                className="submit-btn"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : 'Add Product'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list-container">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={60} />
            <p>No products found. Add your first product to get started!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="modern-product-card">
                <div className="product-image-box">
                  <img src={getCloudinaryUrl(product.image)} alt={product.name} />
                </div>
                <div className="product-info-box">
                  <span className="product-cat-label">{product.category.replace('-', ' ')}</span>
                  <h3 className="product-name-label">{product.name}</h3>
                  <div className="product-meta-row">
                    <span className="product-price-label">₹{product.price}</span>
                    <span className="product-qty-label">Qty: {product.quantity}</span>
                  </div>
                  <button 
                    className="product-remove-btn" 
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
