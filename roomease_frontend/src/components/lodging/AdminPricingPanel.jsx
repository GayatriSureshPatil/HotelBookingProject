import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dynamic_pricing.css';

const API = 'http://127.0.0.1:8000/ramkrishna/lodging/pricing';

const SEASON_OPTIONS = [
  { value: 'High',    label: '☀️  High Season  (+25%)' },
  { value: 'Regular', label: '🍂  Regular Season  (±0%)' },
  { value: 'Low',     label: '🌧️  Low Season  (-15%)' },
];

function OccupancyBar({ label, value }) {
  const cls = value >= 60 ? 'high' : value >= 35 ? 'mid' : 'low';
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#b7c7d7' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#6d8a9e' }}>{value}% occupied</span>
      </div>
      <div className="occ-bar-track">
        <div className={`occ-bar-fill ${cls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * AdminPricingPanel
 * Floating admin button + modal for viewing & updating dynamic pricing factors.
 * Shows live occupancy, current factors, and per-category price breakdowns.
 */
export default function AdminPricingPanel() {
  const [open,         setOpen]       = useState(false);
  const [loading,      setLoading]    = useState(false);
  const [saving,       setSaving]     = useState(false);
  const [pricingData,  setPricingData] = useState(null);
  const [breakdowns,   setBreakdowns]  = useState({});
  const [occupancy,    setOccupancy]   = useState({});
  const [form,         setForm]        = useState({});
  const [saved,        setSaved]       = useState(false);

  // Fetch pricing info whenever modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get(API)
      .then(res => {
        const { pricingData: pd, breakdowns: bd, occupancy: occ } = res.data;
        setPricingData(pd);
        setBreakdowns(bd);
        setOccupancy(occ);
        setForm({
          season:           pd.season,
          isWeekend:        pd.isWeekend,
          localEvent:       pd.localEvent,
          temperature:      pd.temperature,
          competitorPrice:  pd.competitorPrice,
          deluxe_room_demand:   pd.deluxe_room_demand,
          standard_room_demand: pd.standard_room_demand,
          suite_room_demand:    pd.suite_room_demand,
        });
      })
      .catch(e => console.error('Failed to fetch pricing:', e))
      .finally(() => setLoading(false));
  }, [open]);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(API, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // Refresh after save
      const res = await axios.get(API);
      setBreakdowns(res.data.breakdowns);
      setOccupancy(res.data.occupancy);
    } catch (e) {
      alert('Failed to save pricing data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button className="admin-open-btn" onClick={() => setOpen(true)}>
        ⚡ Pricing Admin
      </button>

      {open && (
        <div className="admin-pricing-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="admin-pricing-modal">
            <h2>⚡ Dynamic Pricing Control Panel</h2>
            <p className="subtitle">
              Adjust pricing factors in real-time. Changes affect all room prices immediately.
            </p>

            {loading ? (
              <p style={{ color: '#6d8a9e', textAlign: 'center', padding: 32 }}>Loading pricing data…</p>
            ) : (
              <>
                {/* Live Occupancy */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#c69963', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    📊 Live Room Occupancy (Today)
                  </div>
                  {Object.entries(occupancy).map(([cat, { total, booked }]) => (
                    <OccupancyBar
                      key={cat}
                      label={`${cat} (${booked}/${total} rooms)`}
                      value={total > 0 ? Math.round((booked / total) * 100) : 0}
                    />
                  ))}
                </div>

                {/* Pricing Factors Form */}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c69963', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  🎛️ Pricing Factors
                </div>
                <div className="admin-form-grid">
                  {/* Season */}
                  <div className="admin-form-group">
                    <label>Season</label>
                    <select value={form.season || 'Regular'} onChange={e => handleChange('season', e.target.value)}>
                      {SEASON_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Temperature */}
                  <div className="admin-form-group">
                    <label>Temperature (°C)</label>
                    <input type="number" value={form.temperature ?? ''} onChange={e => handleChange('temperature', parseFloat(e.target.value))} />
                    <span className="hint">≤15°C: -10% | ≥35°C: -15%</span>
                  </div>

                  {/* Competitor Price */}
                  <div className="admin-form-group">
                    <label>Competitor Price (₹)</label>
                    <input type="number" value={form.competitorPrice ?? ''} onChange={e => handleChange('competitorPrice', parseFloat(e.target.value))} />
                  </div>

                  {/* Demand: Deluxe */}
                  <div className="admin-form-group">
                    <label>Deluxe Demand (0–100)</label>
                    <input type="number" min="0" max="100" value={form.deluxe_room_demand ?? ''} onChange={e => handleChange('deluxe_room_demand', parseInt(e.target.value))} />
                  </div>

                  {/* Demand: Standard */}
                  <div className="admin-form-group">
                    <label>Standard Demand (0–100)</label>
                    <input type="number" min="0" max="100" value={form.standard_room_demand ?? ''} onChange={e => handleChange('standard_room_demand', parseInt(e.target.value))} />
                  </div>

                  {/* Demand: Suite */}
                  <div className="admin-form-group">
                    <label>Suite Demand (0–100)</label>
                    <input type="number" min="0" max="100" value={form.suite_room_demand ?? ''} onChange={e => handleChange('suite_room_demand', parseInt(e.target.value))} />
                  </div>

                  {/* Toggles */}
                  <div className="admin-form-group full-width">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="toggle-row">
                        <label>Weekend Pricing (+10%)</label>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!form.isWeekend} onChange={e => handleChange('isWeekend', e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                      <div className="toggle-row">
                        <label>Local Event / Holiday (+15%)</label>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!form.localEvent} onChange={e => handleChange('localEvent', e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price breakdowns preview */}
                {Object.keys(breakdowns).length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#c69963', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      💰 Current Price Breakdown
                    </div>
                    <table className="dp-breakdown-table" style={{ marginBottom: 16 }}>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Base Price</th>
                          <th>Dynamic Price</th>
                          <th>Change</th>
                          <th>Top Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(breakdowns).map(([cat, bd]) => {
                          const pct = bd.percentChange;
                          const color = pct > 0 ? '#ff7a5a' : pct < 0 ? '#3ecf8e' : '#b7c7d7';
                          const topReason = bd.reasons?.find(r => r.type !== 'neutral');
                          return (
                            <tr key={cat}>
                              <td style={{ fontWeight: 600 }}>{cat}</td>
                              <td style={{ color: '#5e7a92' }}>₹{bd.basePrice}</td>
                              <td style={{ color: '#c69963', fontWeight: 700 }}>₹{bd.finalPrice}</td>
                              <td style={{ color, fontWeight: 700 }}>{pct > 0 ? '+' : ''}{pct}%</td>
                              <td style={{ color: '#6d8a9e', fontSize: 11 }}>
                                {topReason ? `${topReason.icon} ${topReason.factor}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}

                {saved && (
                  <div style={{ background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)', color: '#3ecf8e', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                    ✅ Pricing data saved successfully!
                  </div>
                )}
              </>
            )}

            <div className="admin-modal-btns">
              <button className="btn-admin-cancel" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-admin-save" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'Saving…' : '💾 Save Pricing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
