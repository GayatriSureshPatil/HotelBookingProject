import React, { useState, useEffect } from "react";
import "./ReviewsPage.css";
import "./styles/sentiment.css";

const ReviewsPage = () => {
  const [formData, setFormData] = useState({ name: "", review: "", rating: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Use the new sentiment-enriched endpoint
      const response = await fetch("http://localhost:8000/ramkrishna/sentiment/reviews");
      if (response.ok) {
        const result = await response.json();
        setReviews(result.data || []);
      } else {
        console.error("Error fetching reviews");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/ramkrishna/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Review submitted successfully!");
      setFormData({ name: "", review: "", rating: 0 });
      fetchReviews();
    } else {
      alert("Error submitting review!");
    }
  };

  return (
    <div className="reviews-container">
      {/* Review Submission Form */}
      <div className="review-card">
        <h2 className="review-title">Share Your Experience</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="review-input-field"
            pattern="[A-Za-z]+(?:\s[A-Za-z]+)*"
            title="Please enter only letters and spaces, without special characters or numbers."
          />
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= formData.rating ? "filled" : ""}`}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Write your review..."
            value={formData.review}
            onChange={(e) =>
              setFormData({ ...formData, review: e.target.value })
            }
            required
            className="review-textarea-field"
            rows="4"
          ></textarea>
          <button type="submit" className="review-submit-btn">
            Submit Review
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="reviews-heading" style={{ marginBottom: 0 }}>Guest Reviews</h2>
          <button className="sentiment-admin-btn" onClick={() => window.location.href='/ramkrishna/admin/sentiment'} style={{ position: 'static' }}>
            📊 Admin Sentiment Dashboard
          </button>
        </div>

        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review, index) => {
              const { sentiment } = review;
              const isPos = sentiment?.sentiment === 'positive';
              const isNeg = sentiment?.sentiment === 'negative';
              const badgeClass = isPos ? 'positive' : isNeg ? 'negative' : 'neutral';
              const icon = isPos ? '😊' : isNeg ? '😞' : '😐';

              return (
                <div key={index} className="sent-review-item" style={{ background: '#0a1017' }}>
                  <div className="sent-review-header">
                    <div>
                      <div className="sent-review-name">{review.name}</div>
                      <div className="sent-review-stars">{"⭐".repeat(review.stars)}</div>
                    </div>
                    {sentiment && (
                      <div className={`sent-badge ${badgeClass}`}>
                        {icon} {sentiment.sentiment}
                      </div>
                    )}
                  </div>

                  <p className="sent-review-text" style={{ fontStyle: 'italic' }}>"{review.review_text}"</p>

                  {/* Display mentioned categories with sentiment pills */}
                  {sentiment?.categories && (
                    <div className="sent-review-cats">
                      {Object.entries(sentiment.categories).map(([cat, data]) => {
                        if (!data.mentioned) return null;
                        const catClass = data.sentiment === 'positive' ? 'positive' : data.sentiment === 'negative' ? 'negative' : 'neutral';
                        return (
                          <span key={cat} className={`sent-cat-pill ${catClass}`}>
                            {cat}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="sent-review-date">{new Date(review.created_at).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No reviews yet. Be the first to write one!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
