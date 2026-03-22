import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { productData } from '../data/products';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { Loader2, Star, Zap, Minus, Plus, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null); // null, 'checking', 'available', 'unavailable'
  const [activeImage, setActiveImage] = useState('');



  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // 1. Check local data first (flattening the productData object)
        let foundProduct = null;
        Object.values(productData).forEach(categoryList => {
          const match = categoryList.find(p => p.id.toString() === productId);
          if (match) foundProduct = { ...match, local: true };
        });

        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.image);
          setLoading(false);
          return;
        }

        // 2. If not found locally, check Firestore
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data, local: false });
          setActiveImage(data.image);
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const checkDelivery = () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryStatus('invalid');
      return;
    }
    setDeliveryStatus('checking');
    setTimeout(() => {
      // Mock validation: Available for most, unavailable for specific mock code '000000'
      if (pincode === '000000') {
        setDeliveryStatus('unavailable');
      } else {
        setDeliveryStatus('available');
      }
    }, 1000); // Simulate network delay
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    // Optional: show a small toast or feedback
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Add to cart and navigate immediately
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    // Navigate with state to signal direct buy
    navigate('/cart', { state: { directBuy: true } });
  };

  if (loading) {
    return (
      <div className="product-details-page container loading-container">
        <Loader2 size={40} className="animate-spin" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page container error-container">
        <h2>Product not found</h2>
        <Button onClick={() => navigate('/')}>Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="container">
        <div className="product-layout">
          {/* Left: Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              {product.image ? (
                <img 
                  src={getCloudinaryUrl(activeImage)} 
                  alt={product.name} 
                  className="main-image" 
                />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
              <button className="zoom-btn" title="Zoom Image (Mock)">
                <Zap size={20} />
              </button>
            </div>
            {/* Thumbnail strip (Mockup if multiple images existed) */}
            {/* <div className="thumbnail-strip">...</div> */}
          </div>

          {/* Right: Product Info */}
          <div className="product-info">
            {/* Product Title (Keeping it for context, though user focused on description block) */}
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-description-block">
              <h2 className="product-tagline">{product.tagline || "Perfect for Modern Kitchens"}</h2>
              <p className="product-description-text">
                {product.desc || product.description || "ACE Wet Grinder is compact and is suitable for small-quantity grinding. It is perfect for modern kitchens as it delivers fast performance with exceptional results."}
              </p>
              
              {product.color && (
                <p className="product-available-colors">
                  <strong>Available colours:</strong> {product.availableColors ? product.availableColors.join(' and ') : product.color}
                </p>
              )}
            </div>

            <div className="product-price-block">
               <span className="current-price">{product.price}</span>
               <span className="sale-badge">Sale</span>
            </div>

            <div className="product-meta">
               <span className="delivery-tag">Free Delivery</span>
               <div className="rating-badge">
                 <span>{product.rating || (3.0 + (product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 21) / 10).toFixed(1)}</span> <Star size={10} fill="white" className="star-icon" />
               </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="action-row">
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}><Plus size={16} /></button>
              </div>
              <div className="action-buttons">
                <Button onClick={handleAddToCart} className="add-to-cart-large">
                  Add to cart
                </Button>
                <Button onClick={handleBuyNow} className="buy-now-btn">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Delivery Check */}
            <div className="delivery-checker">
              <h4>Use pincode to check delivery info</h4>
              <div className="pincode-input-group">
                <div className="input-with-icon">
                   <div className="location-icon-wrapper"><div className="location-pin-dot"></div></div>
                   <input 
                    type="text" 
                    placeholder="Enter a pin code" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  />
                </div>
                <button onClick={checkDelivery} disabled={pincode.length !== 6}>CHECK</button>
              </div>
              
              {deliveryStatus === 'checking' && <p className="delivery-msg text-blue">Checking...</p>}
              {deliveryStatus === 'available' && <p className="delivery-msg text-green">Delivery available</p>}
              {deliveryStatus === 'unavailable' && <p className="delivery-msg text-red">Not available</p>}
              {deliveryStatus === 'invalid' && <p className="delivery-msg text-red">Invalid pincode</p>}
            </div>

            {/* Highlights (Optional, keeping at bottom) */}
             <div className="product-highlights">
              <div className="highlight-item">
                <ShieldCheck size={20} className="text-primary" />
                <div>
                  <h4>1 Year Warranty</h4>
                </div>
              </div>
              <div className="highlight-item">
                <Zap size={20} className="text-primary" />
                <div>
                  <h4>Energy Efficient</h4>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
