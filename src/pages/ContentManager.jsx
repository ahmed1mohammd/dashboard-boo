import React, { useState, useEffect } from 'react';
import { FileText, Save, MapPin, Phone, Mail, Clock, Share2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import ImageUploader from '../components/Common/ImageUploader';

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [content, setContent] = useState({
    about: {
      label: 'ABOUT BOO',
      heading: 'Your Trusted Automotive Partner',
      description: 'BOO provides integrated automotive solutions including genuine spare parts, premium car accessories, and certified maintenance.',
      secondaryText: 'Founded on principles of precision, transparency, and technical excellence.',
      image: { url: '', publicId: '' },
      stats: [
        { value: '10+', label: 'Years Experience' },
        { value: '1,000+', label: 'Accessories & Upgrades' },
        { value: '5,000+', label: 'OEM Parts in Stock' },
        { value: '98%', label: 'Customer Satisfaction' }
      ]
    },
    contact: {
      address: '19 El-Galaa El-Bahary Street, Shebin El-Kom, Menoufia',
      addressUrl: 'https://maps.google.com/?q=19+El-Galaa+El-Bahary+Street,+Shebin+El-Kom,+Menoufia',
      email: 'info@booautomotive.com',
      workingHours: 'Saturday - Thursday: 9:00 AM - 10:00 PM | Friday: 1:00 PM - 10:00 PM',
      phones: [
        { display: '+20 112 255 9066', raw: '+201122559066' },
        { display: '+20 100 488 4807', raw: '+201004884807' },
        { display: '+20 100 758 7578', raw: '+201007587578' }
      ],
      socials: {
        whatsapp: 'https://wa.me/201122559066',
        facebook: 'https://facebook.com/booautomotive',
        instagram: 'https://instagram.com/booautomotive',
        email: 'mailto:info@booautomotive.com'
      }
    },
    whyBoo: [
      { id: 'accessories', title: 'Car Accessories', description: 'Extensive inventory of verified styling, electronics, and protection accessories.', icon: 'Package' },
      { id: 'oem', title: '100% Genuine OEM Parts', description: 'Extensive inventory of verified OEM parts with warranty protection.', icon: 'Cpu' },
      { id: 'tech', title: 'Advanced Diagnostics', description: 'Master certified technicians using manufacturer-grade computerized diagnostic tools.', icon: 'Wrench' },
      { id: 'support', title: 'Dedicated Support', description: 'End-to-end customer support with transparent pricing and warranty fulfillment.', icon: 'Sparkles' }
    ]
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getContent();
      if (res.success && res.data) {
        setContent(res.data);
      }
    } catch (err) {
      console.error('Failed to load content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await adminApi.updateContent(content);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update website content');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading website content settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Website Content & Settings</h2>
          <p className="section-subtitle">Manage public storefront text, about section, working hours, contact info, and social links</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={submitting}
        >
          <Save size={18} />
          <span>{submitting ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#047857', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
          <CheckCircle2 size={18} />
          Website content successfully updated! Changes are live immediately.
        </div>
      )}

      {error && (
        <div className="form-error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'about' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('about')}
        >
          <Info size={16} />
          <span>About BOO & Story</span>
        </button>
        <button
          className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('contact')}
        >
          <MapPin size={16} />
          <span>Contact & Operating Hours</span>
        </button>
        <button
          className={`btn ${activeTab === 'socials' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('socials')}
        >
          <Share2 size={16} />
          <span>Social Media Links</span>
        </button>
      </div>

      {/* Tab 1: About Section */}
      {activeTab === 'about' && (
        <div className="data-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>About Section Content</h3>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="form-group">
              <label className="form-label">Top Tagline / Label</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.label || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, label: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Main Heading</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.heading || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, heading: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={content.about?.description || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary / Mission Statement</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={content.about?.secondaryText || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, secondaryText: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About Section Showcase Image</label>
            <ImageUploader
              images={content.about?.image?.url ? [content.about.image] : []}
              onChange={(imgs) => setContent({ ...content, about: { ...content.about, image: imgs[0] || { url: '', publicId: '' } } })}
              folder="boo/about"
              maxImages={1}
            />
          </div>

          {/* Stats Bar */}
          <h4 style={{ margin: '24px 0 12px 0', fontSize: '15px' }}>Company Key Metrics / Stats</h4>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {content.about?.stats?.map((stat, idx) => (
              <div key={idx} style={{ background: 'var(--bg-sidebar)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Metric Value</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...content.about.stats];
                      newStats[idx].value = e.target.value;
                      setContent({ ...content, about: { ...content.about, stats: newStats } });
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...content.about.stats];
                      newStats[idx].label = e.target.value;
                      setContent({ ...content, about: { ...content.about, stats: newStats } });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Contact & Operating Hours */}
      {activeTab === 'contact' && (
        <div className="data-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>Location & Branch Details</h3>
          
          <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Physical Street Address</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.address || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Support Email</label>
              <input
                type="email"
                className="form-input"
                value={content.contact?.email || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Link</label>
            <input
              type="text"
              className="form-input"
              value={content.contact?.addressUrl || ''}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, addressUrl: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Working Hours & Days</label>
            <input
              type="text"
              className="form-input"
              value={content.contact?.workingHours || ''}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, workingHours: e.target.value } })}
            />
          </div>

          <h4 style={{ margin: '20px 0 12px 0', fontSize: '15px' }}>Official Phone Numbers</h4>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {content.contact?.phones?.map((phone, idx) => (
              <div key={idx} className="form-group">
                <label className="form-label">Phone Line #{idx + 1}</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone.display}
                  onChange={(e) => {
                    const newPhones = [...content.contact.phones];
                    newPhones[idx] = {
                      display: e.target.value,
                      raw: e.target.value.replace(/\s+/g, '')
                    };
                    setContent({ ...content, contact: { ...content.contact, phones: newPhones } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Socials */}
      {activeTab === 'socials' && (
        <div className="data-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>Social & Communication Channels</h3>
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">WhatsApp URL</label>
              <input
                type="text"
                placeholder="https://wa.me/201122559066"
                className="form-input"
                value={content.contact?.socials?.whatsapp || ''}
                onChange={(e) => setContent({
                  ...content,
                  contact: {
                    ...content.contact,
                    socials: { ...content.contact.socials, whatsapp: e.target.value }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook Page URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/booautomotive"
                className="form-input"
                value={content.contact?.socials?.facebook || ''}
                onChange={(e) => setContent({
                  ...content,
                  contact: {
                    ...content.contact,
                    socials: { ...content.contact.socials, facebook: e.target.value }
                  }
                })}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Instagram Profile URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/booautomotive"
                className="form-input"
                value={content.contact?.socials?.instagram || ''}
                onChange={(e) => setContent({
                  ...content,
                  contact: {
                    ...content.contact,
                    socials: { ...content.contact.socials, instagram: e.target.value }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Form Email Target</label>
              <input
                type="text"
                placeholder="mailto:info@booautomotive.com"
                className="form-input"
                value={content.contact?.socials?.email || ''}
                onChange={(e) => setContent({
                  ...content,
                  contact: {
                    ...content.contact,
                    socials: { ...content.contact.socials, email: e.target.value }
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
