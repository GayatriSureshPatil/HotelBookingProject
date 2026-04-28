import React from 'react';
import '../../styles/dynamic_pricing.css';

/**
 * PricingBadge — compact badge shown on room cards.
 * Shows direction (up/down) and % change relative to base price.
 */
export function PricingBadge({ pricingInfo }) {
  if (!pricingInfo) return null;
  const { percentChange } = pricingInfo;

  if (percentChange > 0) {
    return (
      <span className="dp-badge increase">
        ▲ {percentChange}% Dynamic Pricing
      </span>
    );
  } else if (percentChange < 0) {
    return (
      <span className="dp-badge decrease">
        ▼ {Math.abs(percentChange)}% Discounted
      </span>
    );
  }
  return (
    <span className="dp-badge neutral">Standard Rate</span>
  );
}

/**
 * PricingBreakdown — expandable panel showing all pricing reasons + step-by-step breakdown.
 * Used on SingleRoom page and RoomDetails page.
 */
export function PricingBreakdown({ pricingInfo, collapsed = true }) {
  const [open, setOpen] = React.useState(!collapsed);

  if (!pricingInfo) return null;
  const { basePrice, finalPrice, percentChange, reasons, breakdown } = pricingInfo;

  const pctClass = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'flat';
  const pctLabel = percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`;

  return (
    <div className="dp-panel">
      {/* Header row */}
      <div className="dp-panel-title">
        <span>⚡</span> Dynamic Pricing Active
        <span
          className={`dp-percent-tag ${pctClass}`}
          style={{ marginLeft: 'auto' }}
        >
          {pctLabel} vs. base
        </span>
      </div>

      {/* Final price line */}
      <div className="dp-final-row" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: 14 }}>
        <div>
          <span className="dp-base-price">₹{basePrice}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#c69963' }}>₹{finalPrice}</span>
          <span style={{ fontSize: 13, color: '#6d8a9e', marginLeft: 4 }}>/night</span>
        </div>
        <button className="dp-toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'Hide details ▲' : 'Show price factors ▼'}
        </button>
      </div>

      {open && (
        <>
          {/* Reasons */}
          <div className="dp-reasons">
            {reasons.map((r, i) => (
              <div key={i} className={`dp-reason-item ${r.type}`}>
                <div className="dp-reason-left">
                  <span className="dp-reason-icon">{r.icon}</span>
                  <div>
                    <div className="dp-reason-factor">{r.factor}</div>
                    {r.description && (
                      <div className="dp-reason-desc">{r.description}</div>
                    )}
                  </div>
                </div>
                <span className="dp-reason-impact">{r.impact}</span>
              </div>
            ))}
          </div>

          {/* Step-by-step table */}
          <table className="dp-breakdown-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Multiplier</th>
                <th style={{ textAlign: 'right' }}>Price After</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((step, i) => (
                <tr key={i}>
                  <td>{step.label}</td>
                  <td style={{ color: step.multiplier > 1 ? '#ff7a5a' : step.multiplier < 1 ? '#3ecf8e' : '#6d8a9e' }}>
                    {step.multiplier === 1 ? '—' : `×${step.multiplier}`}
                  </td>
                  <td style={{ textAlign: 'right', color: '#c69963' }}>₹{step.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
