import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Check, Zap, Cpu, Award, ShieldAlert, BadgePercent } from 'lucide-react';

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
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
        [VERIFYING_BILLING_METRICS...]
      </div>
    );
  }

  const creditsPercentage = subscription 
    ? ((subscription.credits - subscription.creditsUsed) / subscription.credits) * 100 
    : 0;

  const robotsPercentage = subscription 
    ? (subscription.robots / subscription.robotsLimit) * 100 
    : 0;

  return (
    <div className="billing-page">
      <div className="page-header">
        <h1>Billing & Subscription</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)' }}>
          BILLING PROTOCOL: ENCRYPTED
        </div>
      </div>

      {subscription && (
        <div className="cyber-panel" style={{ marginBottom: '35px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '25px' }}>
            <div>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>CURRENT ACTIVE SUBSCRIPTION</span>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#fff', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Plan: <span style={{ color: subscription.plan === 'pro' ? 'var(--accent-cyan)' : subscription.plan === 'enterprise' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>{subscription.plan}</span>
              </h2>
            </div>
            
            <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid var(--panel-border-hover)', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <Award size={18} />
              SYSTEM PROTOCOL STATUS: ACTIVE
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Resource Quotas</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Credits Remaining</span>
                  <span style={{ color: '#fff' }}>{subscription.credits - subscription.creditsUsed} / {subscription.credits} CR</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${creditsPercentage}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nodes Active</span>
                  <span style={{ color: '#fff' }}>{subscription.robots} / {subscription.robotsLimit} Units</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${robotsPercentage}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '15px' }}>Included Core Access Features</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                {subscription.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Check size={16} style={{ color: 'var(--accent-green)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid var(--text-muted)' }}>
          <div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TIER 01</span>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Free</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', margin: '15px 0', color: '#fff' }}>$0<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/month</span></p>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 5 Active Robots</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 100 Monthly Credits</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Basic Monitoring</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 1 GB Data Storage</li>
          </ul>
        </div>

        <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--accent-cyan)', boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)', borderTop: '4px solid var(--accent-cyan)' }}>
          <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', borderRadius: '4px', fontSize: '11px', padding: '2px 8px', fontFamily: 'var(--font-mono)' }}>RECOMMENDED</div>
          <div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>TIER 02</span>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Pro</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', margin: '15px 0', color: 'var(--accent-cyan)' }}>$29<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/month</span></p>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 50 Active Robots</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 1000 Monthly Credits</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Advanced Analytics</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> 100 GB Data Storage</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Priority 24/7 Support</li>
          </ul>
          
          <button className="cyber-button" style={{ marginTop: 'auto', width: '100%', height: '42px' }}>
            Activate Pro Protocol
          </button>
        </div>

        <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid var(--accent-gold)' }}>
          <div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>TIER 03</span>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Enterprise</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', margin: '15px 0', color: 'var(--accent-gold)' }}>CUSTOM</p>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Unlimited Robots</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Unlimited Monthly Credits</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Full REST/Websocket API</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Dedicated Systems Engineer</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Custom SLA & Integrations</li>
          </ul>
          
          <button className="cyber-button" style={{ marginTop: 'auto', width: '100%', height: '42px', background: 'linear-gradient(135deg, var(--accent-gold) 0%, rgba(255, 170, 68, 0.5) 100%)', boxShadow: '0 0 10px rgba(255, 170, 68, 0.3)' }}>
            Establish Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
