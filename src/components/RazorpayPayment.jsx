/* src/components/RazorpayPayment.jsx */
import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Loader2, X, CheckCircle, Lock } from 'lucide-react';
import './RazorpayPayment.css';

const RazorpayPayment = ({ amount, onPaymentSuccess, userData }) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: userData?.name || ''
    });

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        
        // Formatting inputs
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }
        
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = (e) => {
        if (e) e.preventDefault();
        
        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
            alert("Please enter full card details.");
            return;
        }

        setLoading(true);

        // Simulate Razorpay Processing Time
        setTimeout(() => {
            setLoading(false);
            setSuccessAnim(true); // Trigger Success Checkmark Overlay

            // Send standard notification and resolve
            setTimeout(() => {
                onPaymentSuccess("pay_" + Math.random().toString(36).substr(2, 9));
                setShowModal(false);
            }, 1800);
        }, 2500);
    };

    return (
        <div className="razorpay-payment-container">
            <div className="razor-badge">
                <ShieldCheck size={14} /> <span>Secured by Razorpay</span>
            </div>
            
            <div className="razorpay-summary">
                <h3>Card & Netbanking</h3>
                <p>Complete your payment using Razorpay's secure checkout</p>
            </div>

            <button 
                className="pay-with-razorpay-btn" 
                onClick={() => setShowModal(true)} 
            >
                <CreditCard size={20} />
                <span>Pay ₹{amount}</span>
            </button>

            <div className="pay-footer" style={{ marginTop: '15px' }}>
                <span>Safe payment experience</span>
                <img 
                   src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
                   alt="UPI" 
                   className="razor-logo" 
                   style={{ height: '12px' }}
                />
            </div>

            {/* HIGH-FIDELITY RAZORPAY MOCK MODAL */}
            {showModal && (
                <div style={modalStyles.backdrop}>
                    <div style={modalStyles.modalContainer}>
                        {/* Header: Amirthaa Brand */}
                        <div style={modalStyles.header}>
                            <div style={modalStyles.headerTop}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Amirthaa</div>
                                <button onClick={() => !loading && !successAnim && setShowModal(false)} style={modalStyles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={modalStyles.headerBottom}>
                                <div>Total Payable</div>
                                <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>₹{amount}</div>
                            </div>
                        </div>

                        {/* Relative container for overlay animations */}
                        <div style={{ position: 'relative' }}>
                            {/* Body: Card Form */}
                            <div style={modalStyles.body}>
                                <div style={modalStyles.sectionTitle}>
                                    <CreditCard size={16} /> <span>Add New Card</span>
                                </div>
                                
                                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={inputContainer}>
                                        <label style={labelStyle}>Card Number</label>
                                        <input 
                                            type="text" name="cardNumber" 
                                            placeholder="0000 0000 0000 0000" 
                                            value={cardDetails.cardNumber} onChange={handleInputChange}
                                            style={inputStyle} required
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={inputContainer}>
                                            <label style={labelStyle}>Expiry</label>
                                            <input 
                                                type="text" name="expiry" 
                                                placeholder="MM/YY" 
                                                value={cardDetails.expiry} onChange={handleInputChange}
                                                style={inputStyle} required
                                            />
                                        </div>
                                        <div style={inputContainer}>
                                            <label style={labelStyle}>CVV</label>
                                            <input 
                                                type="password" name="cvv" 
                                                placeholder="123" 
                                                value={cardDetails.cvv} onChange={handleInputChange}
                                                style={inputStyle} required
                                            />
                                        </div>
                                    </div>

                                    <div style={inputContainer}>
                                        <label style={labelStyle}>Cardholder Name</label>
                                        <input 
                                            type="text" name="name" 
                                            placeholder="John Doe" 
                                            value={cardDetails.name} onChange={handleInputChange}
                                            style={inputStyle} required
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                                        <input type="checkbox" id="saveCard" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#3399cc' }} />
                                        <label htmlFor="saveCard">Save card securely for future payments</label>
                                    </div>

                                    <button type="submit" disabled={loading} style={modalStyles.payBtn}>
                                        {loading ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <Loader2 size={18} className="animate-spin" /> Processing...
                                            </div>
                                        ) : `Pay ₹${amount}`}
                                    </button>
                                </form>
                            </div>

                            {/* Razorpay Footer */}
                            <div style={modalStyles.rpFooter}>
                                <Lock size={12} /> Secured by <strong>Razorpay</strong>
                            </div>

                            {/* Success Overlay Animation */}
                            {successAnim && (
                                <div style={modalStyles.successOverlay}>
                                    <div style={{ animation: 'popIn 0.5s ease-out forwards', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <CheckCircle size={60} color="#4CAF50" fill="#e8f5e9" />
                                        <h3 style={{ margin: 0, color: '#4CAF50' }}>Payment Successful</h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Redirecting...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style>
                {`
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

// Styles for the realistic Razorpay modal clone
const modalStyles = {
    backdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '20px'
    },
    modalContainer: {
        width: '100%', maxWidth: '380px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
        backgroundColor: '#52008c', // Amirthaa primary color
        color: '#fff',
        padding: '20px',
    },
    headerTop: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '15px'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', 
        borderRadius: '50%', width: '30px', height: '30px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    headerBottom: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        fontSize: '0.9rem', opacity: 0.9
    },
    body: {
        padding: '20px',
        backgroundColor: '#fff'
    },
    sectionTitle: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '1.1rem', fontWeight: '600', color: '#333',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
    },
    payBtn: {
        backgroundColor: '#3399cc', // Razorpay Blue
        color: '#fff', border: 'none', borderRadius: '4px',
        padding: '14px', fontSize: '1.05rem', fontWeight: 'bold',
        cursor: 'pointer', marginTop: '10px', width: '100%',
        transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    rpFooter: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        fontSize: '0.75rem', color: '#888',
        padding: '15px', backgroundColor: '#fafafa',
        borderTop: '1px solid #eee'
    },
    successOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 10
    }
};

const inputContainer = {
    display: 'flex', flexDirection: 'column', gap: '6px', flex: 1
};
const labelStyle = {
    fontSize: '0.8rem', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const inputStyle = {
    padding: '12px 14px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', 
    fontSize: '1rem', transition: 'border 0.2s',
    fontFamily: 'monospace'
};

export default RazorpayPayment;
