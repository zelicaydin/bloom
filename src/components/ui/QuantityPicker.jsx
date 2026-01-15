import React, { useState } from 'react';

const QuantityPicker = ({ value = 1, onIncrease, onDecrease, style = {} }) => {
  const [hovered, setHovered] = useState(null); // "minus" | "plus" | null

  return (
    <div
      style={{
        width: '140px', // 40 + 60 + 40
        display: 'inline-flex',
        backgroundColor: '#2a2a2a',
        color: '#fff',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '-0.02em',
        borderRadius: 0,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {/* Minus */}
      <button
        onClick={onDecrease}
        onMouseEnter={() => setHovered('minus')}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...styles.button,
          backgroundColor:
            hovered === 'minus' ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}
        tabIndex={-1}
        aria-hidden
      >
        −
      </button>

      {/* Value */}
      <div style={styles.value}>{value}</div>

      {/* Plus */}
      <button
        onClick={onIncrease}
        onMouseEnter={() => setHovered('plus')}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...styles.button,
          backgroundColor:
            hovered === 'plus' ? 'rgba(255,255,255,0.08)' : 'transparent',
        }}
        tabIndex={-1}
        aria-hidden
      >
        +
      </button>
    </div>
  );
};

const styles = {
  button: {
    width: '40px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: 0,
    fontSize: '1.25rem',
    cursor: 'pointer',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'background-color 0.15s ease',
  },
  value: {
    width: '60px', // 👈 number area
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    pointerEvents: 'none',
  },
};

export default QuantityPicker;
