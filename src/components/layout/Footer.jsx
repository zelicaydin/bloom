import React from 'react';

const Footer = ({ navigate }) => {
  const handleLinkClick = (path) => {
    if (navigate) {
      navigate(path);
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Main Footer Content */}
        <div style={styles.mainContent}>
          {/* Left Column - Brand */}
          <div style={styles.brandColumn}>
            <img 
              src="/logo.png" 
              alt="Bloom" 
              style={styles.logo}
            />
            <p style={styles.tagline}>
              Sustainable beauty, thoughtfully engineered. Every product, every interaction, designed with purpose.
            </p>
            <div style={styles.socialSection}>
              <div style={styles.socialIcons}>
                <a 
                  href="#" 
                  aria-label="Instagram" 
                  style={styles.socialIcon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Twitter" 
                  style={styles.socialIcon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Facebook" 
                  style={styles.socialIcon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div style={styles.navColumns}>
            <div style={styles.navColumn}>
              <h3 style={styles.columnTitle}>Shop</h3>
              <nav style={styles.navList}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLinkClick('/catalogue'); }} 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Catalogue
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLinkClick('/bloombox'); }} 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  BloomBox
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLinkClick('/cart'); }} 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Shopping Cart
                </a>
              </nav>
            </div>

            <div style={styles.navColumn}>
              <h3 style={styles.columnTitle}>Company</h3>
              <nav style={styles.navList}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLinkClick('/about'); }} 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Our Story
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLinkClick('/about'); }} 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Sustainability
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Careers
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Press
                </a>
              </nav>
            </div>

            <div style={styles.navColumn}>
              <h3 style={styles.columnTitle}>Support</h3>
              <nav style={styles.navList}>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Contact Us
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Shipping & Delivery
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Returns & Exchanges
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  FAQ
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Track Your Order
                </a>
              </nav>
            </div>

            <div style={styles.navColumn}>
              <h3 style={styles.columnTitle}>Legal</h3>
              <nav style={styles.navList}>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Terms of Service
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Cookie Policy
                </a>
                <a 
                  href="#" 
                  style={styles.navLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  Accessibility
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <div style={styles.bottomContent}>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} Bloom. All rights reserved.
            </p>
            <div style={styles.bottomLinks}>
              <a 
                href="#" 
                style={styles.bottomLink}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                Sustainability Report
              </a>
              <span style={styles.separator}>•</span>
              <a 
                href="#" 
                style={styles.bottomLink}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                Carbon Neutral
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#141414',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '0',
    marginTop: '120px',
    width: '100%',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '80px 80px 40px 80px',
    boxSizing: 'border-box',
    width: '100%',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2.5fr',
    gap: '180px',
    paddingBottom: '60px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logo: {
    height: '44px',
    width: 'auto',
    objectFit: 'contain',
    marginBottom: '8px',
    alignSelf: 'flex-start',
  },
  tagline: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
    maxWidth: '320px',
    letterSpacing: '-0.01em',
  },
  socialSection: {
    marginTop: '8px',
  },
  socialIcons: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  socialIcon: {
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  navColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '60px',
  },
  navColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  columnTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  navLink: {
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    lineHeight: 1.5,
    display: 'inline-block',
    position: 'relative',
  },
  bottomBar: {
    padding: '32px 0',
  },
  bottomContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  copyright: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  bottomLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bottomLink: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'color 0.2s ease',
    letterSpacing: '-0.01em',
  },
  separator: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '0.85rem',
  },
};

export default Footer;
