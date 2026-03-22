import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { Loader2 } from "lucide-react";
import emailjs from '@emailjs/browser';
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CheckCircle2, Mail, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";

import "./Register.css";

// 📧 EmailJS Configuration - Located outside for stable initialization
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_wfch6qa',
  TEMPLATE_ID: 'template_i0kcgqm',
  PUBLIC_KEY: 'OPMfVyQCdFOMqiV0r'
};

// Initialize early
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // OTP States
  const [showOtpView, setShowOtpView] = useState(false);
  const [userOtp, setUserOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    qualification: "",
    currentStatus: "",
    password: ""
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const fillSampleData = () => {
    setFormData({
      firstName: "Arun",
      lastName: "Kumar",
      gender: "male",
      birthMonth: "May",
      birthDay: "15",
      birthYear: "1995",
      email: "arun.kumar@example.com",
      phone: "9840012345",
      address: "No. 42, West Street",
      city: "Erode",
      district: "Erode",
      state: "Tamil Nadu",
      postalCode: "638001",
      qualification: "Graduate",
      currentStatus: "Professional",
      password: "Password@123"
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // OTP Timer Logic
  React.useEffect(() => {
    let interval;
    if (showOtpView && timer > 0 && !otpVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [showOtpView, timer, otpVerified]);

  const sendOtpEmail = async (email, otpCode) => {
    // 🛡️ Safety check to ensure keys are provided (don't send if they look like placeholders)
    if (!EMAILJS_CONFIG.SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID.includes('service_xxx') || !EMAILJS_CONFIG.PUBLIC_KEY) {
      console.warn("⚠️ DEVELOPER TEST MODE: EmailJS keys not fully configured.");
      console.log(`%c 🛡️ YOUR TEST OTP IS: ${otpCode} `, 'background: #4b0082; color: #fff; font-size: 20px; padding: 10px; border-radius: 5px;');
      return new Promise((resolve) => setTimeout(resolve, 1500));
    }

    try {
      const companyName = "Amirthaa"; // You can change this to Maruthi Sports if needed

      const templateParams = {
        to_email: email,
        to_name: formData.firstName || "User",
        user_name: formData.firstName || "User",
        user_email: email,
        name: formData.firstName || "User",
        company_name: companyName,
        from_name: companyName,
        reply_to: "support@amirthaa.com",
        otp_code: otpCode,
        message: `Your Amirthaa login OTP is: ${otpCode}`,
        time: new Date().toLocaleTimeString()
      };

      console.log('📤 Attempting to send OTP to:', email);

      // Using modern EmailJS call format
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY // Passed as string for better compatibility
      );
      
      console.log('✅ EmailJS Success Response:', response.status, response.text);
      return response;
    } catch (error) {
      console.error('❌ EMAIL SERVICE FAILED:', error);
      
      // Detailed error reporting for the user
      let errorMessage = "Email service failed to send OTP.";
      if (error?.text) {
         errorMessage = `EmailJS Error: ${error.text}`;
      } else if (error?.message) {
         errorMessage = `Email Error: ${error.message}`;
      }

      console.log(`%c 🛡️ [FAILSAFE OTP] YOUR CODE IS: ${otpCode} `, 'background: #000; color: #00ff00; font-size: 20px; padding: 10px; border: 2px solid red;');
      
      // We will throw the real error so the user knows exactly why the email isn't sending
      if (error?.status === 412) {
         throw new Error("EmailJS Error 412: Your connected Gmail account might have expired. Please go to EmailJS dashboard and reconnect your email service.");
      } else if (error?.status === 429) {
         throw new Error("EmailJS Error 429: You have exceeded your daily/monthly quota for free emails.");
      } else {
         throw new Error(errorMessage);
      }
    }
  };

  const generateAndSendOtp = async (emailToUse) => {
    const targetEmail = emailToUse || formData.email;
    setLoading(true);
    setError("");
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    try {
      const result = await sendOtpEmail(targetEmail, newOtp);
      setShowOtpView(true);
      setTimer(30);
      setResendDisabled(true);
      
      if (result && result.status === 'mocked') {
        const isGmailError = result.errorStatus === 412;
        if (isGmailError) {
          setSuccess("Email Link Expired: Please reconnect your Gmail account in the EmailJS Dashboard. Use the OTP from Browser Console (F12) to continue for now.");
        } else {
          setSuccess(`Configuration Note (Error ${result.errorStatus || '?' }): Please check Browser Console (F12) for your OTP code.`);
        }
      } else {
        setSuccess(`An OTP has been sent to ${targetEmail}`);
      }
    } catch (err) {
      console.error("OTP send failure:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (userOtp === generatedOtp) {
      setOtpVerified(true);
      setSuccess("OTP Verified Successfully!");
      // Simulate a short delay to show success state before finalizing
      setTimeout(() => {
        completeRegistration();
      }, 1500);
    } else {
      setError("Invalid OTP. Please check and try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.email) {
      setError("Email and Phone are required");
      return;
    }

    // Validate 10-digit phone
    if (formData.phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if email already exists
      const emailQuery = query(collection(db, "users"), where("email", "==", formData.email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        setError("This email address is already registered. Please login or use another email.");
        setLoading(false);
        return;
      }

      // Check if phone already exists
      const phoneQuery = query(collection(db, "users"), where("phone", "==", formData.phone));
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!phoneSnapshot.empty) {
        setError("This phone number is already registered. Please login or use another phone number.");
        setLoading(false);
        return;
      }

      // Instead of signup, we start OTP process
      await generateAndSendOtp(formData.email);
      
    } catch (err) {
      console.error("Error during validation:", err);
      setError(err.message || "An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const { password, firstName, lastName, email, ...extraData } = formData;
      
      await signup(email, password, fullName, extraData);
      
      alert("Registration Successful! Your account has been created.");
      navigate("/");
    } catch (err) {
      console.error("Error during final registration:", err);
      setError(err.message || "Registration failed. Please try again.");
      setOtpVerified(false); // Let them try verification again if something failed
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {!showOtpView ? (
          <form onSubmit={handleSubmit} className="register-form">
            <h1 className="register-title">Amirthaa User Registration</h1>
            <p className="register-subtitle">Join us by filling in the details below</p>
            
            <button 
              type="button" 
              className="sample-data-btn"
              onClick={fillSampleData}
            >
              Fill Sample Credentials
            </button>
            
            <div className="block-divider">
              <span></span><span></span><span></span><span></span><span></span>
            </div>

            {error && <div className="register-error">{error}</div>}

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="side-by-side">
                <div className="input-with-sub">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <span className="sub-label">First Name</span>
                </div>
                <div className="input-with-sub">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <span className="sub-label">Last Name</span>
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Please Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Birth Date */}
            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <div className="side-by-side three-cols">
                <div className="input-with-sub">
                  <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                    <option value="">Please select a month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <span className="sub-label">Month</span>
                </div>
                <div className="input-with-sub">
                  <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                    <option value="">Please select a day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="sub-label">Day</span>
                </div>
                <div className="input-with-sub">
                  <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                    <option value="">Please select a year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="sub-label">Year</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div className="input-with-sub">
                <input
                  type="email"
                  name="email"
                  placeholder="ex: myname@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <span className="sub-label">example@example.com</span>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-sub">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10 digit number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <span className="sub-label">Please enter a valid phone number.</span>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Address</label>
              <div className="input-with-sub margin-bottom">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <span className="sub-label">Door No , Street</span>
              </div>
              <div className="input-with-sub margin-bottom">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <span className="sub-label">City</span>
              </div>
              <div className="side-by-side margin-bottom">
                <div className="input-with-sub">
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                  <span className="sub-label">District</span>
                </div>
                <div className="input-with-sub">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  <span className="sub-label">State</span>
                </div>
              </div>
              <div className="input-with-sub">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
                <span className="sub-label">Postal / Zip Code</span>
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? (
                  <div className="flex-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  "REGISTER"
                )}
              </Button>
            </div>

            <div className="auth-toggle">
              Already have an account?
              <Link to="/login" className="toggle-btn">
                Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="otp-view">
            <h1 className="register-title">OTP Verification</h1>
            <p className="register-subtitle">We've sent a 6-digit code to your email</p>

            <div className="otp-icon">
              <Mail size={48} />
            </div>

            {error && <div className="register-error">{error}</div>}
            {success && <div className="register-success">{success}</div>}
            
            {!otpVerified ? (
              <div className="otp-container">
                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="main-otp-input"
                      placeholder="000000"
                      maxLength="6"
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  
                  <div className="otp-actions">
                    <Button type="submit" fullWidth disabled={loading}>
                      {loading ? (
                        <div className="flex-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        "VERIFY OTP"
                      )}
                    </Button>
                    
                    <div className="otp-resend-row">
                      {resendDisabled ? (
                        <span className="resend-timer">Resend OTP in {timer}s</span>
                      ) : (
                        <button 
                          type="button" 
                          className="resend-btn" 
                          onClick={() => generateAndSendOtp(formData.email)}
                          disabled={loading}
                        >
                          <RefreshCw size={14} />
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                </form>
                
                <button 
                  type="button" 
                  className="back-btn" 
                  onClick={() => setShowOtpView(false)}
                  disabled={loading}
                >
                  <ArrowLeft size={14} /> Back to Registration
                </button>
              </div>
            ) : (
              <div className="otp-success-msg">
                <div className="flex-center flex-col gap-4 py-8">
                  <ShieldCheck size={64} color="#22c55e" />
                  <h3 className="text-xl font-bold text-slate-800">Verified!</h3>
                  <p className="text-slate-600">Completing your registration...</p>
                  <Loader2 className="animate-spin text-indigo-900" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
