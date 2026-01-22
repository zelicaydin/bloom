import React from 'react';

const About = ({ navigate }) => {
  return (
    <div style={styles.container}>
      <div style={styles.heroRow}>
        <div style={styles.heroCopy}>
          <h1 style={styles.title}>Bloom is more than a product. It’s a promise.</h1>
          <p style={styles.lead}>
            A promise that beauty can be brilliant <span style={styles.leadEmphasis}>and</span> kind—
            to your skin, to your routine, and to the planet that makes it all possible.
          </p>
          <div style={styles.heroBadges}>
            <div style={styles.badge}>
              <span style={styles.badgeLabel}>Built Sustainably</span>
              <span style={styles.badgeText}>Green-by-design digital experience</span>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeLabel}>Circular Products</span>
              <span style={styles.badgeText}>Low‑waste, high‑impact formulas</span>
            </div>
          </div>
          <button
            style={styles.cta}
            onClick={() => navigate('/catalogue')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              e.currentTarget.style.borderRadius = '0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderRadius = '0';
            }}
          >
            Explore the Bloom collection
          </button>
        </div>
        <div style={styles.heroPanel}>
          <div style={styles.heroStatCard}>
            <p style={styles.statNumber}>100%</p>
            <p style={styles.statLabel}>digital-first & local‑storage powered</p>
            <p style={styles.statText}>
              Bloom’s experience is engineered to feel luxurious without needing heavy,
              energy‑hungry infrastructure. Fast, lightweight, and consciously coded.
            </p>
          </div>
          <div style={styles.heroStatRow}>
            <div style={styles.heroMiniCard}>
              <p style={styles.miniLabel}>Sustainable stack</p>
              <p style={styles.miniText}>
                We design features to be efficient—less data transferred, fewer requests,
                more thought behind every interaction.
              </p>
            </div>
            <div style={styles.heroMiniCard}>
              <p style={styles.miniLabel}>Sustainable products</p>
              <p style={styles.miniText}>
                From refill‑ready packaging to consciously sourced ingredients, every
                item in Bloom is vetted with the same care as our code.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.heading}>The story behind Bloom</h2>
        <p style={styles.text}>
          Bloom started as a simple question: <strong>what if your favorite beauty ritual
          didn’t cost the earth anything extra?</strong> No greenwashing, no vague promises—
          just products and a digital experience built with real accountability.
        </p>
        <p style={styles.text}>
          Instead of chasing trends, we obsess over impact. That means traceable
          ingredients, responsible partners, and a shopping experience that encourages
          thoughtful choices, not impulse hauls.
        </p>
      </section>

      <section style={styles.columnsSection}>
        <div style={styles.column}>
          <h3 style={styles.subheading}>Sustainable in what we build</h3>
          <p style={styles.text}>
            Bloom is engineered to be light on resources and heavy on experience.
            We favor minimal, performant interfaces, local‑storage powered personalization,
            and progressive enhancement over bloated, always‑on backends.
          </p>
          <p style={styles.text}>
            Every screen is designed with intent: fewer steps, fewer calls, fewer
            wasted pixels—because efficient software is a sustainability decision too.
          </p>
        </div>
        <div style={styles.column}>
          <h3 style={styles.subheading}>Sustainable in what you receive</h3>
          <p style={styles.text}>
            The products you discover through Bloom are curated around a strict
            set of principles: low‑waste packaging, cleaner formulations, ethical
            sourcing, and transparency you can feel good about.
          </p>
          <p style={styles.text}>
            Every BloomBox, every bottle, every bar is a small vote for
            better industry standards—and your routine becomes part of that signal.
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Our north star: beautiful, on purpose</h2>
        <p style={styles.text}>
          Bloom isn’t trying to be the loudest brand in the room. We’re here to be
          the most intentional—the one that proves you can have effortless routines,
          powerful results, and a softer footprint all at once.
        </p>
        <p style={styles.text}>
          <strong>Our philosophy is simple:</strong> if it doesn’t make you feel good and do
          good, it doesn’t ship. That goes for UI decisions, infrastructure choices,
          and the physical products you bring home.
        </p>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Join the Bloom movement</h2>
          <p style={styles.ctaText}>
            Build a routine that reflects your values. Thoughtful technology, thoughtful
            ingredients—one beautiful, sustainable habit at a time.
          </p>
          <div style={styles.ctaButtons}>
            <button
              style={styles.primaryCta}
              onClick={() => navigate('/catalogue')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                e.currentTarget.style.borderRadius = '0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderRadius = '0';
              }}
            >
              Discover sustainable beauty
            </button>
            <button
              style={styles.secondaryCta}
              onClick={() => navigate('/bloombox')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderRadius = '0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderRadius = '0';
              }}
            >
              Personalize my BloomBox
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

const styles = {
  container: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    backgroundColor: '#141414',
    color: '#fff',
  },
  heroRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    gap: '64px',
    maxWidth: '1200px',
    margin: '0 auto 100px auto',
    alignItems: 'flex-start',
  },
  heroCopy: {
    textAlign: 'left',
  },
  heroPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '32px',
    letterSpacing: '-0.04em',
    textAlign: 'left',
    lineHeight: 1.15,
  },
  lead: {
    fontSize: '1.2rem',
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '32px',
    maxWidth: '36rem',
    textAlign: 'left',
  },
  leadEmphasis: {
    fontWeight: 600,
    color: '#ffffff',
  },
  heroBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '36px',
  },
  badge: {
    padding: '14px 20px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
  },
  badgeLabel: {
    display: 'block',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '6px',
    fontWeight: 600,
    textAlign: 'left',
  },
  badgeText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
  },
  cta: {
    marginTop: '8px',
    backgroundColor: '#ffffff',
    color: '#000',
    border: 'none',
    padding: '16px 32px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  heroStatCard: {
    padding: '28px 24px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  statNumber: {
    margin: 0,
    fontSize: '3rem',
    fontWeight: 500,
    letterSpacing: '-0.04em',
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1,
  },
  statLabel: {
    margin: '8px 0 12px 0',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'left',
    fontWeight: 500,
  },
  statText: {
    margin: 0,
    fontSize: '0.95rem',
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'left',
  },
  heroStatRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  heroMiniCard: {
    padding: '20px 18px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  miniLabel: {
    margin: '0 0 8px 0',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 600,
    textAlign: 'left',
  },
  miniText: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'left',
  },
  section: {
    maxWidth: '800px',
    margin: '0 auto 80px auto',
    textAlign: 'left',
  },
  heading: {
    fontSize: '2.25rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '28px',
    letterSpacing: '-0.02em',
    textAlign: 'left',
    lineHeight: 1.3,
  },
  columnsSection: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '48px',
    maxWidth: '1000px',
    margin: '0 auto 96px auto',
  },
  column: {
    textAlign: 'left',
    padding: '24px',
    borderRadius: 0,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  subheading: {
    fontSize: '1.5rem',
    fontWeight: 500,
    marginBottom: '20px',
    color: '#ffffff',
    textAlign: 'left',
    letterSpacing: '-0.01em',
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: 1.85,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '24px',
    textAlign: 'left',
  },
  ctaSection: {
    maxWidth: '960px',
    margin: '0 auto 60px auto',
    padding: '48px 40px',
    borderRadius: 0,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
  },
  ctaContent: {
    textAlign: 'left',
  },
  ctaTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    marginBottom: '16px',
    textAlign: 'left',
    color: '#ffffff',
  },
  ctaText: {
    margin: 0,
    fontSize: '1.1rem',
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '28px',
    maxWidth: '36rem',
    textAlign: 'left',
  },
  ctaButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  primaryCta: {
    backgroundColor: '#ffffff',
    color: '#000',
    border: 'none',
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  secondaryCta: {
    background: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.2s ease',
  },
};

export default About;
