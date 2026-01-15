import React from 'react';

// Hardcoded markers with icons related to the text
const markersData = {
  sustainablePackaging: {
    lines: ['Sustainable', 'Packaging'],
    icon: (
      <svg
        width='36'
        height='36'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#ffffffff'
        strokeWidth='2'
      >
        <rect x='3' y='7' width='18' height='13' rx='2' ry='2' /> {/* box */}
        <path d='M3 7l9-4 9 4' /> {/* lid */}
      </svg>
    ),
  },
  organicIngredients: {
    lines: ['Organic', 'Ingredients'],
    icon: (
      <svg
        width='36'
        height='36'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#ffffffff'
        strokeWidth='2'
      >
        <circle cx='12' cy='12' r='10' /> {/* fruit/organic symbol */}
        <path d='M12 2v20' /> {/* stem/leaf */}
      </svg>
    ),
  },
  recyclable: {
    lines: ['90%', 'Recyclable'],
    icon: (
      <svg
        width='36'
        height='36'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#ffffffff'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <polyline points='3 17 12 6 21 17' /> {/* arrow cycle */}
        <polyline points='3 17 12 22 21 17' /> {/* cycle arrow base */}
      </svg>
    ),
  },
  crueltyFree: {
    lines: ['Cruelty', 'Free'],
    icon: (
      <svg
        width='36'
        height='36'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#ffffffff'
        strokeWidth='2'
      >
        <path d='M12 21s-6-4.35-6-10.5S12 3 12 3s6 4.35 6 10.5S12 21 12 21z' />{' '}
        {/* paw/animal symbol */}
      </svg>
    ),
  },
};

// Marker item component
const Marker = ({ icon, lines }) => (
  <div style={styles.marker}>
    <div style={styles.icon}>{icon}</div>
    <div style={styles.text}>
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  </div>
);

// Main component
const SustainabilityMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;

  return (
    <div style={styles.container}>
      {markers
        .filter((id) => markersData[id]) // only valid markers
        .map((id) => (
          <Marker
            key={id}
            icon={markersData[id].icon}
            lines={markersData[id].lines}
          />
        ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  marker: {
    display: 'flex',
    flexDirection: 'column', // icon above text
    alignItems: 'flex-start', // align everything to left
    textAlign: 'left', // text left
    maxWidth: '80px',
    fontSize: '1rem',
    color: '#fff',
  },
  icon: {
    marginBottom: '8px',
  },
  text: {
    lineHeight: 1.2,
  },
};

export default SustainabilityMarkers;
