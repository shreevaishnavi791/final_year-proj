import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Admin Auth error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const docRef = doc(db, "users", user.uid);
      let docSnap;
      
      try {
        docSnap = await getDoc(docRef);
      } catch (firestoreError) {
        console.error("Firestore error during login check:", firestoreError);
        if (firestoreError.message.includes("offline")) {
          throw new Error("Cannot verify admin status (database is offline). Please check your connection.");
        }
        throw firestoreError;
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Only allow admins
        if (data.role !== 'admin') {
          await signOut(auth);
          throw new Error("Access denied. Admin privileges required.");
        }
        
        const updatedData = {
          ...data,
          loginTime: new Date().toISOString()
        };
        await setDoc(docRef, updatedData);
        setUserData(updatedData);
      } else {
        // Create as admin if not exists (per walkthrough logic)
        const newData = {
          userId: user.uid,
          name: user.displayName || "Admin",
          email: user.email,
          role: "admin",
          loginTime: new Date().toISOString()
        };
        await setDoc(docRef, newData);
        setUserData(newData);
      }
    } catch (authError) {
      if (authError.message.includes("offline")) {
        throw new Error("Network connection lost. Please check your internet and try again.");
      }
      throw authError;
    }
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    userData,
    login,
    logout,
    loading
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0f172a',
        color: 'white',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Initializing Admin Portal...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
