import React from "react";
import "./Testimonials.css";

const Testimonials = ({ items = [] }) => {
  const sample = items.length
    ? items
    : [
        {
          id: 1,
          name: "Priya R.",
          quote: "Great build quality and fast delivery. Highly recommended!",
          role: "Home Chef",
        },
        {
          id: 2,
          name: "Karthik S.",
          quote: "The mixer performs like a dream — quiet and powerful.",
          role: "Baker",
        },
        {
          id: 3,
          name: "Meena P.",
          quote: "Excellent customer support and authentic products.",
          role: "Homeowner",
        },
      ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h3 className="testimonials-title">What our customers say</h3>
        <div className="testimonials-grid">
          {sample.map((t) => (
            <div key={t.id} className="testimonial-card">
              <div className="quote">“{t.quote}”</div>
              <div className="author">
                {t.name} <span className="role">— {t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
