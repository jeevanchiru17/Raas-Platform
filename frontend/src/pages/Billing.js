import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, CreditCard, Sparkles, Star, Zap } from 'lucide-react';

const Billing = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/billing/subscription');
        setSubscription(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching billing:', error);
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOADING BILLING PORTAL...</p>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="page-header">
        <div>
          <h1>Billing & Subscription</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage platform credits, usage quotas, and tiers</p>
        </div>
      </div>

      {subscription && (
        <div className="glass-panel subscription-panel" style={{ marginBottom: '30px' }}>
          <div className="sub-info-col">
            <span className="sub-label">Current Active Plan</span>
            <span className="sub-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
              <Sparkles size={18} />
              {subscription.plan.toUpperCase()} TIER
            </span>
          </div>
          
          <div className="sub-info-col">
            <span className="sub-label">Credits Allocated</span>
            <span className="sub-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {subscription.credits - subscription.creditsUsed} / {subscription.credits} Available
            </span>
          </div>

          <div className="sub-info-col">
            <span className="sub-label">Registered Fleet Units</span>
            <span className="sub-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {subscription.robots} / {subscription.robotsLimit}
            </span>
          </div>
          
          <div className="sub-info-col" style={{ width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '10px' }}>
            <span className="sub-label" style={{ marginBottom: '8px', display: 'block' }}>Features Included in Plan:</span>
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
              {subscription.features.map((feature, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-main)' }}>
                  <Check size={16} style={{ color: 'var(--accent-emerald)' }} />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plans Comparison */}
      <h2 style={{ fontSize: '20px', color: 'var(--text-main)', marginTop: '40px', marginBottom: '10px' }}>Upgrade / Modify Subscription</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>Choose the computing resources and robot limits that suit your automation pipeline</p>

      <div className="plans-grid">
        {/* Free Plan */}
        <div className="glass-panel plan-card">
          <div>
            <span className="plan-name">Free Tier</span>
            <div className="price">$0<span>/month</span></div>
            <ul className="plan-features">
              <li><Check size={16} /> 5 Fleet Robots Limit</li>
              <li><Check size={16} /> 100 Sim Credits/month</li>
              <li><Check size={16} /> Basic Telemetry Graphs</li>
              <li><Check size={16} /> Community Forums Support</li>
            </ul>
          </div>
          <button className="modern-btn secondary" disabled style={{ cursor: 'not-allowed' }}>Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="glass-panel plan-card pro-tier">
          <div className="pro-badge">Popular</div>
          <div>
            <span className="plan-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Pro Automation
              <Star size={16} style={{ fill: 'var(--accent-purple)', color: 'var(--accent-purple)' }} />
            </span>
            <div className="price">$29<span>/month</span></div>
            <ul className="plan-features">
              <li><Check size={16} /> 50 Fleet Robots Limit</li>
              <li><Check size={16} /> 1,000 Sim Credits/month</li>
              <li><Check size={16} /> Real-time 2D Blueprint Mapping</li>
              <li><Check size={16} /> Advanced ROS Nodes Logging</li>
              <li><Check size={16} /> 24/7 Priority Support Desk</li>
            </ul>
          </div>
          <button className="modern-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Zap size={16} />
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="glass-panel plan-card">
          <div>
            <span className="plan-name">Enterprise Suite</span>
            <div className="price">Custom<span>/quota</span></div>
            <ul className="plan-features">
              <li><Check size={16} /> Unlimited Fleet Robots</li>
              <li><Check size={16} /> Unlimited Sim Credits</li>
              <li><Check size={16} /> Custom Multi-Robot Swarms</li>
              <li><Check size={16} /> Complete Platform API Access</li>
              <li><Check size={16} /> Dedicated Account Engineer</li>
            </ul>
          </div>
          <button className="modern-btn secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CreditCard size={16} />
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
