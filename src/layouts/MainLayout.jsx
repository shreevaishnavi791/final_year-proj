import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const { pathname } = useLocation();

  // Scroll to Top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Global Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.anim-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]); // Re-run when page changes

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
