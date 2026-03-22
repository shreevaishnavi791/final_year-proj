import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
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
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check role from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.role !== 'user' && data.role !== 'admin') {
        await signOut(auth);
        throw new Error("Access denied. This is the User Login page.");
      }
      
      // Update login details
      const updatedData = {
        ...data,
        loginTime: new Date().toISOString()
      };
      await setDoc(docRef, updatedData);
      setUserData(updatedData);
    } else {
      // If new user, create as 'user' role automatically as requested
      const newData = {
        userId: user.uid,
        name: user.displayName || "User",
        email: user.email,
        role: "user",
        loginTime: new Date().toISOString()
      };
      await setDoc(docRef, newData);
      setUserData(newData);
    }
  };

  const signup = async (email, password, name, extraData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const newData = {
      userId: user.uid,
      name: name,
      email: email,
      role: "user",
      loginTime: new Date().toISOString(),
      ...extraData
    };
    await setDoc(doc(db, "users", user.uid), newData);
    setUserData(newData);
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    userData,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
