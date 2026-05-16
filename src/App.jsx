import { useState, useCallback } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    color: #f0ede6;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  :root {
    --green: #b8f55a;
    --red: #ff4d4d;
    --yellow: #ffd166;
    --dim: #2a2a2a;
    --border: #2f2f2f;
    --text-muted: #666;
  }

  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  .header {
    margin-bottom: 40px;
  }

  .label-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--green);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 10vw, 72px);
    line-height: 0.95;
    letter-spacing: 0.02em;
    color: #f0ede6;
  }

  .title span {
    color: var(--green);
  }

  .subtitle {
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-muted);
    font-family: 'DM Mono', monospace;
  }

  .search-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    margin-top: 36px;
  }

  .input-wrap {
    flex: 1;
    position: relative;
  }

  input[type="text"], input[type="number"] {
    width: 100%;
    background: var(--dim);
    border: 1px solid var(--border);
    color: #f0ede6;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    padding: 14px 16px;
    outline: none;
    border-radius: 6px;
    transition: border-color 0.15s;
  }

  input:focus {
    border-color: var(--green);
  }

  input::placeholder {
    color: #444;
  }

  .cost-row {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    align-items: center;
  }

  .cost-row label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .cost-row input {
    max-width: 120px;
  }

  .btn {
    background: var(--green);
    color: #0a0a0a;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 14px;
    padding: 14px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.02em;
  }

  .btn:hover { opacity: 0.85; }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover { border-color: #555; color: #f0ede6; opacity: 1; }

  .loading {
    text-align: center;
    padding: 60px 0;
    font-family: 'DM Mono', monospace;
    color: var(--text-muted);
    font-size: 13px;
    letter-spacing: 0.1em;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--green);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .verdict {
    border-radius: 8px;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    animation: fadeUp 0.3s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .verdict.buy  { background: rgba(184, 245, 90, 0.08); border: 1px solid rgba(184, 245, 90, 0.3); }
  .verdict.pass { background: rgba(255, 77, 77, 0.08);  border: 1px solid rgba(255, 77, 77, 0.3); }
  .verdict.maybe{ background: rgba(255, 209, 102, 0.08);border: 1px solid rgba(255, 209, 102, 0.3); }

  .verdict-icon  { font-size: 36px; flex-shrink: 0; }
  .verdict-label { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.05em; line-height: 1; }

  .verdict.buy   .verdict-label { color: var(--green); }
  .verdict.pass  .verdict-label { color: var(--red); }
  .verdict.maybe .verdict-label { color: var(--yellow); }

  .verdict-reason { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-family: 'DM Mono', monospace; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
    animation: fadeUp 0.35s ease;
  }

  .stat-card {
    background: var(--dim);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 18px 16px;
  }

  .stat-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.03em; line-height: 1; }
  .stat-value.green  { color: var(--green); }
  .stat-value.red    { color: var(--red); }
  .stat-value.yellow { color: var(--yellow); }
  .stat-value.white  { color: #f0ede6; }
  .stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-family: 'DM Mono', monospace; }

  .section-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }

  .listings { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; animation: fadeUp 0.4s ease; }

  .listing-row {
    background: var(--dim);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .listing-title { font-size: 13px; color: #ccc; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .listing-meta  { display: flex; gap: 12px; align-items: center; flex-shrink: 0; }
  .listing-price { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; color: #f0ede6; }

  .badge { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
  .badge-sold   { background: rgba(184, 245, 90, 0.12); color: var(--green); border: 1px solid rgba(184, 245, 90, 0.2); }
  .badge-active { background: rgba(255, 209, 102, 0.1); color: var(--yellow); border: 1px solid rgba(255, 209, 102, 0.2); }

  .breakdown {
    background: var(--dim);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    animation: fadeUp 0.45s ease;
  }

  .breakdown-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; border-bottom: 1px solid #1e1e1e; font-family: 'DM Mono', monospace; }
  .breakdown-row:last-child { border-bottom: none; font-weight: 500; }
  .breakdown-row .key { color: var(--text-muted); }
  .breakdown-row .val { color: #f0ede6; }
  .breakdown-row.total .val { color: var(--green); font-size: 15px; }
  .breakdown-row.total .key { color: #f0ede6; }

  .error-box {
    background: rgba(255, 77, 77, 0.08);
    border: 1px solid rgba(255, 77, 77, 0.25);
    border-radius: 8px;
    padding: 20px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--red);
  }

  .disclaimer {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #333;
    line-height: 1.6;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #1a1a1a;
  }

  .live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(184, 245, 90, 0.08);
    border: 1px solid rgba(184, 245, 90, 0.2);
    border-radius: 6px;
    padding: 10px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--green);
    margin-bottom: 24px;
    letter-spacing: 0.05em;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    background: var(--green);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .search-row { flex-direction: column; }
  }
`;

async function fetchEbayData(query) {
  const res = await fetch(`/api/ebay?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'eBay API request failed');
  }
  return res.json();
}

function calcMargin(avgSold, cost) {
  const ebayFee    = avgSold * 0.1325;
  const processing = avgSold * 0.03;
  const shipping   = 6.50;
  const net        = avgSold - ebayFee - processing - shipping - cost;
  const roi        = cost > 0 ? (net / cost) * 100 : 0;
  return { net, roi, ebayFee, processing, shipping };
}

function getVerdict(roi, sellThrough) {
  if (roi >= 40 && sellThrough >= 0.6)
    return { type: "buy",   icon: "✅", label: "BUY IT", reason: `Strong ROI + ${Math.round(sellThrough * 100)}% sell-through rate` };
  if (roi >= 20 && sellThrough >= 0.4)
    return { type: "maybe", icon: "⚠️", label: "MAYBE",  reason: `Acceptable margin but slower sell-through` };
  return   { type: "pass",  icon: "❌", label: "PASS",   reason: `ROI too thin or slow market — not worth the risk` };
}

export default function App() {
  const [query,   setQuery]   = useState("");
  const [cost,    setCost]    = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    if (!query.trim() || !cost) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data   = await fetchEbayData(query.trim());
      const margin  = calcMargin(data.avgSoldPrice, parseFloat(cost));
      const verdict = getVerdict(margin.roi, data.sellThroughRate);
      setResult({ ...data, margin, verdict });
    } catch (e) {
      setError(e.message || "Could not fetch eBay data. Check your App ID and try again.");
    } finally {
      setLoading(false);
    }
  }, [query, cost]);

  const reset = () => { setResult(null); setError(null); setQuery(""); setCost(""); };

  const roiColor = result
    ? result.margin.roi >= 40 ? "green" : result.margin.roi >= 20 ? "yellow" : "red"
    : "white";

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="header">
          <div className="label-tag">// Pallet Resell Intelligence</div>
          <h1 className="title">COMP<span>SCAN</span></h1>
          <p className="subtitle">scan → comp → decide → profit</p>
        </div>

        <div className="live-badge">
          <div className="live-dot" />
          LIVE EBAY DATA — eBay Finding API
        </div>

        <div className="search-row">
          <input
            type="text"
            placeholder="Product name, brand, model, or UPC..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            disabled={loading}
          />
          <button className="btn" onClick={run} disabled={loading || !query || !cost}>
            {loading ? "Scanning..." : "Run Comps"}
          </button>
        </div>

        <div className="cost-row">
          <label>My cost per unit ($)</label>
          <input
            type="number"
            placeholder="e.g. 8.00"
            value={cost}
            min="0"
            step="0.01"
            onChange={e => setCost(e.target.value)}
            disabled={loading}
          />
          {result && (
            <button className="btn btn-ghost" onClick={reset} style={{ marginLeft: "auto" }}>
              New Scan
            </button>
          )}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            PULLING LIVE COMPS...
          </div>
        )}

        {error && <div className="error-box">⚠ {error}</div>}

        {result && (
          <>
            <div className={`verdict ${result.verdict.type}`}>
              <div className="verdict-icon">{result.verdict.icon}</div>
              <div>
                <div className="verdict-label">{result.verdict.label}</div>
                <div className="verdict-reason">{result.verdict.reason}</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Avg Sold Price</div>
                <div className="stat-value white">${result.avgSoldPrice.toFixed(2)}</div>
                <div className="stat-sub">eBay sold listings</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Net Profit / Unit</div>
                <div className={`stat-value ${roiColor}`}>
                  {result.margin.net >= 0 ? "+" : ""}${result.margin.net.toFixed(2)}
                </div>
                <div className="stat-sub">after all fees</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">ROI</div>
                <div className={`stat-value ${roiColor}`}>{result.margin.roi.toFixed(0)}%</div>
                <div className="stat-sub">{result.margin.roi >= 40 ? "Strong" : result.margin.roi >= 20 ? "Marginal" : "Weak"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sell-Through</div>
                <div className={`stat-value ${result.sellThroughRate >= 0.6 ? "green" : result.sellThroughRate >= 0.4 ? "yellow" : "red"}`}>
                  {Math.round(result.sellThroughRate * 100)}%
                </div>
                <div className="stat-sub">demand signal</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Listings</div>
                <div className="stat-value white">${result.avgActivePrice.toFixed(2)}</div>
                <div className="stat-sub">avg ask price</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Category</div>
                <div className="stat-value white" style={{ fontSize: "18px", paddingTop: "4px" }}>{result.category}</div>
                <div className="stat-sub">{result.product?.slice(0, 22)}</div>
              </div>
            </div>

            <div className="section-label">
              Recent Sold Listings
              {result.soldEstimated && <span style={{color:'var(--yellow)',marginLeft:8,fontStyle:'normal'}}>· estimated (eBay limit)</span>}
            </div>
            <div className="listings">
              {result.soldListings.map((l, i) => (
                <div className="listing-row" key={i}>
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-meta">
                    <div className="listing-price">${l.price.toFixed(2)}</div>
                    <div className="badge badge-sold">SOLD</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-label">Active Competition</div>
            <div className="listings">
              {result.activeListings.map((l, i) => (
                <div className="listing-row" key={i}>
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-meta">
                    <div className="listing-price">${l.price.toFixed(2)}</div>
                    <div className="badge badge-active">LISTED</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-label">Margin Breakdown</div>
            <div className="breakdown">
              <div className="breakdown-row">
                <span className="key">Avg eBay Sold Price</span>
                <span className="val">${result.avgSoldPrice.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span className="key">eBay Final Value Fee (13.25%)</span>
                <span className="val">− ${result.margin.ebayFee.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span className="key">Payment Processing (3%)</span>
                <span className="val">− ${result.margin.processing.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span className="key">Avg Shipping Cost</span>
                <span className="val">− ${result.margin.shipping.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span className="key">Your Cost / Unit</span>
                <span className="val">− ${parseFloat(cost).toFixed(2)}</span>
              </div>
              <div className="breakdown-row total">
                <span className="key">NET PROFIT / UNIT</span>
                <span className="val">
                  {result.margin.net >= 0 ? "+" : ""}${result.margin.net.toFixed(2)} ({result.margin.roi.toFixed(0)}% ROI)
                </span>
              </div>
            </div>
          </>
        )}

        <div className="disclaimer">
          COMPSCAN v1.0 — Live eBay data via Finding API (findCompletedItems + findItemsByKeywords).
          Fee model: eBay 13.25% FVF + 3% payment processing + $6.50 avg shipping.
          Buy threshold: ROI ≥ 40% AND sell-through ≥ 60%.
        </div>
      </div>
    </>
  );
}
