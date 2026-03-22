import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { Trash2, Edit2, ShieldCheck, Truck, Loader2, Star, Clock, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import './Cart.css';
import RazorpayPayment from '../components/RazorpayPayment';

const Cart = ({ standalone = true }) => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'address', 'summary', 'payment'
  const [paymentMethod, setPaymentMethod] = useState(''); // 'upi', 'card', 'cod'
  const [addressData, setAddressData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: ''
  });

  // Pre-populate address from userData if available
  useEffect(() => {
    if (userData) {
      const newAddress = {
        name: userData.name || '',
        phone: userData.phone || '',
        street: userData.address || '',
        city: userData.city || '',
        pincode: userData.postalCode || ''
      };
      setAddressData(newAddress);

      // If Direct Buy and address is complete, jump to summary
      if (location.state?.directBuy && newAddress.name && newAddress.phone && newAddress.street && newAddress.pincode) {
        setCheckoutStep('summary');
      }
    }
  }, [userData, location.state]);

  // Calculate Totals
  const totalProductPrice = cartItems.reduce((acc, item) => {
    const priceStr = item.price.toString().replace(/[^0-9]/g, '');
    const price = parseInt(priceStr, 10);
    return acc + (price * item.quantity);
  }, 0);

  const discountAmount = Math.round(totalProductPrice * 0.2); 
  const feeAmount = 9; // System fee as seen in image
  const orderTotal = totalProductPrice - discountAmount + feeAmount;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (checkoutStep === 'cart') {
      setCheckoutStep('address');
    } else if (checkoutStep === 'address') {
      if (!addressData.name || !addressData.phone || !addressData.street || !addressData.city || !addressData.pincode) {
        alert("Please fill all the address fields.");
        return;
      }
      setCheckoutStep('summary');
    } else if (checkoutStep === 'summary') {
      setCheckoutStep('payment');
    }
  };

  const handlePlaceOrder = React.useCallback(async (transactionId = null) => {
    if (cartItems.length === 0) return;
    if (!user) {
      alert("Please login to place an order.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        customerName: addressData.name,
        phone: addressData.phone,
        address: `${addressData.street}, ${addressData.city}, ${addressData.pincode}`,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null
        })),
        totalAmount: orderTotal,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      clearCart();
      setSuccess(true);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cartItems, user, paymentMethod, addressData, orderTotal, clearCart, setSuccess]);

  if (success) {
    return (
      <div className="cart-page empty-state container">
        <div className="success-icon-wrapper">
          <ShieldCheck size={80} color="#4CAF50" />
        </div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. Your order has been recorded.</p>
        <div className="success-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="primary" onClick={() => navigate('/orders')}>View My Orders</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-state container">
        <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="empty-cart-img" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`cart-page ${!standalone ? 'embedded' : ''}`}>
       <div className={standalone ? "container" : ""}>
         {/* Redesigned Stepper to match image */}
         <div className="checkout-stepper-container">
           <div className="checkout-stepper">
             <div className="step-wrapper">
               <div className={`step-circle ${checkoutStep === 'address' ? 'active' : (['summary', 'payment'].includes(checkoutStep) ? 'completed' : '')}`}>1</div>
               <span className={`step-label ${checkoutStep === 'address' ? 'active' : ''}`}>Address</span>
             </div>
             
             <div className="step-line-new"></div>
             
             <div className="step-wrapper">
               <div className={`step-circle ${checkoutStep === 'summary' ? 'active' : (checkoutStep === 'payment' ? 'completed' : '')}`}>2</div>
               <span className={`step-label ${checkoutStep === 'summary' ? 'active' : ''}`}>Order Summary</span>
             </div>
             
             <div className="step-line-new"></div>
             
             <div className="step-wrapper">
               <div className={`step-circle ${checkoutStep === 'payment' ? 'active' : ''}`}>3</div>
               <span className={`step-label ${checkoutStep === 'payment' ? 'active' : ''}`}>Payment</span>
             </div>
           </div>
         </div>

         <div className="cart-layout">
           <div className="cart-items-section">
             {/* STEP 1: CART (Review Items) */}
             {(checkoutStep === 'cart' || checkoutStep === 'address') && (
                <>
                  <div className="section-header-branded">
                     <h3>Product Details ({cartItems.length} items)</h3>
                  </div>
                  <div className="cart-items-list-modern">
                    {cartItems.map((item) => (
                      <div key={item.id} className="modern-cart-card">
                        <div className="modern-card-content">
                           {item.image && (
                             <div className="modern-image-container">
                                <img src={getCloudinaryUrl(item.image)} alt={item.name} className="modern-item-image" />
                             </div>
                           )}
                           <div className="modern-info-container">
                             <h4 className="modern-item-title">{item.name}</h4>
                             <div className="modern-pricing-row">
                                <span className="modern-price">{item.price}</span>
                                <span className="modern-discount">20% Off</span>
                             </div>
                             <div className="modern-qty-row">
                               <span>Qty: {item.quantity}</span>
                             </div>
                             <button className="modern-remove-btn" onClick={() => removeFromCart(item.id)}>
                               REMOVE
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
             )}

             {/* STEP 2: ADDRESS */}
             {checkoutStep === 'address' && (
                <div className="address-section">
                  <div className="section-header">
                     <h3>Delivery Address</h3>
                  </div>
                  <div className="address-form">
                     <div className="form-group">
                       <label>Full Name</label>
                       <input type="text" name="name" value={addressData.name} onChange={handleAddressChange} placeholder="Enter your name" />
                     </div>
                     <div className="form-group">
                       <label>Phone Number</label>
                       <input type="tel" name="phone" value={addressData.phone} onChange={handleAddressChange} placeholder="Enter 10-digit number" />
                     </div>
                     <div className="form-group">
                       <label>Street / Door No</label>
                       <input type="text" name="street" value={addressData.street} onChange={handleAddressChange} placeholder="Street address" />
                     </div>
                     <div className="side-by-side">
                       <div className="form-group">
                         <label>City / State</label>
                         <input type="text" name="city" value={addressData.city} onChange={handleAddressChange} placeholder="City, State" />
                       </div>
                       <div className="form-group">
                         <label>Pincode</label>
                         <input type="text" name="pincode" value={addressData.pincode} onChange={handleAddressChange} placeholder="6-digit pincode" maxLength="6" />
                       </div>
                     </div>
                  </div>
                </div>
             )}

             {/* STEP 3: ORDER SUMMARY */}
             {checkoutStep === 'summary' && (
                <div className="summary-step-view">
                  <div className="deliver-to-card">
                     <div className="deliver-to-header">
                       <div className="deliver-label">Deliver to:</div>
                       <button className="change-btn" onClick={() => setCheckoutStep('address')}>Change</button>
                     </div>
                     <div className="deliver-content">
                       <div className="customer-name-row">
                         <strong>{addressData.name}</strong>
                         <span className="address-tag">HOME</span>
                       </div>
                       <p className="address-text">
                         {addressData.street}, {addressData.city} {addressData.pincode}
                       </p>
                       <p className="phone-text">{addressData.phone}</p>
                     </div>
                  </div>

                  <div className="summary-items-list">
                     {cartItems.map((item) => (
                       <div key={item.id} className="summary-item-card">
                         <div className="summary-item-main">
                           <div className="summary-thumb-wrapper">
                             <img src={getCloudinaryUrl(item.image)} alt={item.name} className="summary-thumb" />
                             <div className="qty-badge">Qty: {item.quantity}</div>
                           </div>
                           <div className="summary-info">
                             <h4 className="summary-name">{item.name}</h4>
                             <div className="summary-rating">
                               <div className="rating-badge">4.0 <Star size={10} fill="white" /></div>
                               <span className="rating-count">(14,315)</span>
                               <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="assured-img" />
                             </div>
                             <div className="summary-prices">
                               <span className="summary-current">{item.price}</span>
                               <span className="summary-discount">20% Off</span>
                             </div>
                             <div className="summary-delivery">
                               <Truck size={14} color="#388e3c" /> <span>EXPRESS Delivery by tomorrow</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>

                  <div className="donation-banner">
                     <div className="donation-content">
                        <h4>Donate to Project Foundation</h4>
                        <p>Support transformative social work in India</p>
                     </div>
                     <div className="donation-options">
                        <span>₹10</span> <span>₹20</span> <span>₹50</span> <span>₹100</span>
                     </div>
                  </div>
                </div>
             )}

             {/* STEP 4: PAYMENT */}
             {checkoutStep === 'payment' && (
                <div className="payment-step-view">
                   <div className="payment-header-card">
                      <div className="amount-row">
                         <div className="amount-label">Total Amount <ChevronDown size={16} /></div>
                         <div className="amount-value">₹{orderTotal}</div>
                      </div>
                      <div className="cashback-banner">
                         <div className="cashback-percent">5% Cashback</div>
                         <div className="cashback-text">Claim now with payment offers</div>
                         <div className="payment-icons">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.png" alt="Paytm" className="pay-icon" />
                            <img src="https://seeklogo.com/images/P/phonepe-phone-pe-logo-8A16892348-seeklogo.com.png" alt="PhonePe" className="pay-icon" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1000px-UPI-Logo-vector.svg.png" alt="UPI" className="pay-icon" />
                            <img src="https://cdn-icons-png.flaticon.com/512/179/179457.png" alt="Visa" className="pay-icon" />
                            <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" className="pay-icon" />
                         </div>
                      </div>
                   </div>

                   <div className="payment-options-list">
                      {/* UPI */}
                      <div className={`payment-option-item ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}>
                         <div className="option-header">
                            <div className="radio-circle">
                               {paymentMethod === 'upi' && <div className="radio-inner"></div>}
                            </div>
                            <span className="option-label">
                               UPI 
                               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1000px-UPI-Logo-vector.svg.png" alt="UPI" className="option-inline-icon" />
                            </span>
                            <ChevronDown size={18} className="expand-icon" />
                         </div>
                         {paymentMethod === 'upi' && (
                            <div className="option-details visible">
                               <div className="upi-input-group">
                                  <input type="text" placeholder="Enter your UPI ID" />
                                  <button className="verify-btn">Verify</button>
                                </div>
                                <button className="pay-btn" onClick={() => handlePlaceOrder(null)} disabled={loading}>
                                   {loading ? "PROCESSING..." : `Pay ₹${orderTotal}`}
                                </button>
                            </div>
                         )}
                      </div>

                      {/* Razorpay Option */}
                      <div className={`payment-option-item ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                         <div className="option-header">
                            <div className="radio-circle">
                               {paymentMethod === 'card' && <div className="radio-inner"></div>}
                            </div>
                            <span className="option-label">
                               Pay with Razorpay (Cards, UPI, NetBanking)
                               <div className="card-icons-inline">
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="option-inline-icon" />
                                  <img src="https://cdn-icons-png.flaticon.com/512/179/179457.png" alt="Visa" className="option-inline-icon" />
                                  <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" className="option-inline-icon" />
                               </div>
                            </span>
                            <ChevronDown size={18} className="expand-icon" />
                         </div>
                         {paymentMethod === 'card' && (
                            <div className="option-details visible">
                                <div className="stripe-wrapper-cart" onClick={(e) => e.stopPropagation()}>
                                   <RazorpayPayment 
                                      amount={orderTotal} 
                                      onPaymentSuccess={handlePlaceOrder}
                                      userData={addressData}
                                   />
                                </div>
                            </div>
                         )}
                      </div>

                      {/* Cash on Delivery */}
                      <div className={`payment-option-item ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                         <div className="option-header">
                            <div className="radio-circle">
                               {paymentMethod === 'cod' && <div className="radio-inner"></div>}
                            </div>
                            <span className="option-label">Cash on Delivery</span>
                            <ChevronDown size={18} className="expand-icon" />
                         </div>
                         {paymentMethod === 'cod' && (
                            <div className="option-details visible">
                               <button className="pay-btn" onClick={() => handlePlaceOrder(null)} disabled={loading}>
                                  {loading ? "CONFIRMING..." : "CONFIRM ORDER"}
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             )}
           </div>

           {/* Price Details Sidebar */}
           <div className="cart-summary-section">
             <div className="price-details-card redesigned">
               <h3 className="price-title">PRICE DETAILS</h3>
               <div className="divider"></div>
               <div className="price-row">
                 <span>Price ({cartItems.length} items)</span>
                 <span>₹{totalProductPrice}</span>
               </div>
               <div className="price-row">
                 <span>Discount</span>
                 <span className="text-green">- ₹{discountAmount}</span>
               </div>
               <div className="price-row">
                 <span>Platform Fee</span>
                 <span>₹{feeAmount}</span>
               </div>
               <div className="price-row">
                 <span>Delivery Charges</span>
                 <span className="text-green">FREE</span>
               </div>
               <div className="divider double"></div>
               <div className="price-row total-row">
                 <span>Total Amount</span>
                 <span>₹{orderTotal}</span>
               </div>
               <div className="savings-banner">
                 You will save ₹{discountAmount} on this order
               </div>
             </div>

             <div className="action-button-container">
               {checkoutStep !== 'payment' && (
                  <Button 
                    className="continue-btn-large" 
                    variant="primary" 
                    onClick={handleContinue}
                  >
                    CONTINUE
                  </Button>
               )}
             </div>

             <p className="secure-payment-text">
               <ShieldCheck size={14} /> Safe and secure payments. 100% Authentic products.
             </p>
           </div>
         </div>
       </div>

       {/* Sticky Mobile Footer */}
       {['cart', 'address', 'summary'].includes(checkoutStep) && (
          <div className="sticky-mobile-footer">
             <div className="mobile-price-review">
                <span className="m-price">₹{orderTotal}</span>
                <button className="view-price-btn">View price details</button>
             </div>
             <button className="mobile-continue-btn" onClick={handleContinue}>
               CONTINUE
             </button>
          </div>
       )}
    </div>
  );
};

export default Cart;

