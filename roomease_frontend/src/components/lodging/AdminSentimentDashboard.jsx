import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/sentiment.css";

const AdminSentimentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get("http://localhost:8000/ramkrishna/sentiment/insights");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching sentiment insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="sentiment-page">
        <h1 style={{ textAlign: "center", marginTop: "100px" }}>Loading Sentiment Insights...</h1>
      </div>
    );
  }

  const { insights, recentReviews } = data;
  const {
    total,
    counts,
    satisfactionRate,
    overallScore,
    overallSentiment,
    categories,
    topComplaints,
    topPraises,
    recommendations
  } = insights;

  // Derive donut circle label/color for overall sentiment
  const donutColor = overallSentiment === 'positive' ? '#3ecf8e' : overallSentiment === 'negative' ? '#ff7a5a' : '#5e7a92';

  return (
    <div className="sentiment-page">
      <h1>Admin Sentiment Dashboard</h1>
      <p className="subtitle">Real-time analysis of {total} guest reviews using the Sentiment Engine.</p>

      {/* Top Overview Cards */}
      <div className="sent-stats-row">
        <div className="sent-stat-card total">
          <div className="sent-stat-label">Total Reviews</div>
          <div className="sent-stat-value">{total}</div>
          <div className="sent-stat-sub">Analyzed successfully</div>
        </div>
        <div className="sent-stat-card positive">
          <div className="sent-stat-label">Positive Sentiment</div>
          <div className="sent-stat-value">{counts.positive}</div>
          <div className="sent-stat-sub">{Math.round((counts.positive / total) * 100) || 0}% of total</div>
        </div>
        <div className="sent-stat-card negative">
          <div className="sent-stat-label">Negative Sentiment</div>
          <div className="sent-stat-value">{counts.negative}</div>
          <div className="sent-stat-sub">{Math.round((counts.negative / total) * 100) || 0}% of total</div>
        </div>
        <div className="sent-stat-card neutral">
          <div className="sent-stat-label">Neutral Sentiment</div>
          <div className="sent-stat-value">{counts.neutral}</div>
          <div className="sent-stat-sub">{Math.round((counts.neutral / total) * 100) || 0}% of total</div>
        </div>
      </div>

      <div className="sent-grid-2">
        {/* Overall Satisfaction & Score */}
        <div className="sent-panel">
          <div className="sent-panel-title">
            <ion-icon name="heart"></ion-icon> Overall Satisfaction
          </div>
          <div className="sent-donut-wrap">
            <div className={`sent-circle ${overallSentiment}`}>
              <div className="sent-circle-pct">{satisfactionRate}%</div>
              <div className="sent-circle-label">Happy Guests</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={`overall-sentiment-label ${overallSentiment}`}>
                {overallSentiment === 'positive' ? '😊 Positive Trend' : overallSentiment === 'negative' ? '😞 Negative Trend' : '😐 Mixed Trend'}
              </div>
              <p style={{ fontSize: 13, color: '#8da8be', lineHeight: 1.5 }}>
                The average sentiment score across all reviews is <strong>{overallScore}</strong> (on a scale of -1 to +1).
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="sent-panel">
          <div className="sent-panel-title">
            <ion-icon name="bulb"></ion-icon> Actionable Recommendations
          </div>
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <div key={i} className="rec-card">
                <div className="rec-cat">{rec.category}</div>
                <div className="rec-text">{rec.recommendation}</div>
              </div>
            ))
          ) : (
            <div style={{ color: '#6d8a9e', fontStyle: 'italic', fontSize: 13, marginTop: 20 }}>
              No critical action items currently identified. Keep up the good work!
            </div>
          )}
        </div>
      </div>

      <div className="sent-grid-2">
        {/* Category Breakdown */}
        <div className="sent-panel">
          <div className="sent-panel-title">
            <ion-icon name="list"></ion-icon> Category Performance
          </div>
          {Object.entries(categories).map(([cat, info]) => {
            if (info.reviewCount === 0) return null;
            // Map score (-1 to 1) to percentage (0 to 100%) for the bar
            const pct = Math.max(0, Math.min(100, (info.avgScore + 1) / 2 * 100));
            return (
              <div key={cat} className="sat-bar-wrap">
                <div className="sat-bar-label">
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{cat}</span>
                  <span>{info.reviewCount} mentions ({info.sentiment})</span>
                </div>
                <div className="sat-bar-track">
                  <div className={`sat-bar-fill ${info.sentiment}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Keywords */}
        <div className="sent-panel">
          <div className="sent-panel-title">
            <ion-icon name="chatbubbles"></ion-icon> Top Keywords
          </div>
          <div className="sent-grid-2" style={{ gap: '30px' }}>
            <div>
              <div style={{ fontSize: 12, color: '#3ecf8e', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Most Praised</div>
              {topPraises.length > 0 ? topPraises.slice(0, 5).map((kw, i) => {
                const max = topPraises[0].count;
                const pct = (kw.count / max) * 100;
                return (
                  <div key={i} className="kw-item">
                    <div className="kw-word">{kw.word}</div>
                    <div className="kw-bar-track"><div className="kw-bar-fill pos" style={{ width: `${pct}%` }}></div></div>
                    <div className="kw-count">{kw.count}</div>
                  </div>
                );
              }) : <div style={{ fontSize: 12, color: '#5e7a92' }}>No data</div>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#ff7a5a', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Most Complained</div>
              {topComplaints.length > 0 ? topComplaints.slice(0, 5).map((kw, i) => {
                const max = topComplaints[0].count;
                const pct = (kw.count / max) * 100;
                return (
                  <div key={i} className="kw-item">
                    <div className="kw-word">{kw.word}</div>
                    <div className="kw-bar-track"><div className="kw-bar-fill neg" style={{ width: `${pct}%` }}></div></div>
                    <div className="kw-count">{kw.count}</div>
                  </div>
                );
              }) : <div style={{ fontSize: 12, color: '#5e7a92' }}>No data</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Summary */}
      <div className="sent-panel" style={{ marginTop: 20 }}>
        <div className="sent-panel-title">
          <ion-icon name="time"></ion-icon> Recent Reviews Analyzed
        </div>
        {recentReviews && recentReviews.length > 0 ? (
          <div className="sent-grid-2">
            {recentReviews.map((review, i) => {
              const { sentiment } = review;
              const isPos = sentiment?.sentiment === 'positive';
              const isNeg = sentiment?.sentiment === 'negative';
              const badgeClass = isPos ? 'positive' : isNeg ? 'negative' : 'neutral';
              const icon = isPos ? '😊' : isNeg ? '😞' : '😐';

              return (
                <div key={i} className="sent-review-item">
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
                  <p className="sent-review-text" style={{ fontStyle: 'italic', fontSize: 12 }}>"{review.review_text}"</p>
                  
                  {/* Category sentiment pills */}
                  {sentiment?.categories && (
                    <div className="sent-review-cats" style={{ marginBottom: 6 }}>
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
                  
                  <div className="sent-review-date" style={{ fontSize: 10 }}>{new Date(review.created_at).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#5e7a92' }}>No recent reviews.</p>
        )}
      </div>

    </div>
  );
};

export default AdminSentimentDashboard;
