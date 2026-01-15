import React from 'react';

const Button = ({ label, onClick, type = 'button', style = {}, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        borderRadius: 0,
        backgroundColor: '#fff',
        color: '#000',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '-0.02em',
        padding: '12px 20px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        ...style, // allow overrides if needed
      }}
      {...props}
    >
      {label}
    </button>
  );
};

export default Button;
