import React, { useState } from 'react';

const ProductCard = ({ product, navigate }) => {
  const [hover, setHover] = useState(false);

  const handleClick = () => {
    if (navigate) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        transform: hover ? 'scale(1.025)' : 'scale(1)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
            
      <div style={styles.imageWrapper}>
        <img
          src={product.image || 'https://via.placeholder.com/400'}
          alt={product.name}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400';
          }}
        />
      </div>
      {/* Type • Brand above name */}
      <p style={styles.typeBrand}>
        {product.type} • {product.brand}
      </p>
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.price}>${product.price}</p>
          
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s ease', // smooth hover
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '320px',
    overflow: 'hidden',
    backgroundColor: '#333', // dark gray behind image
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  typeBrand: {
    fontSize: '14px',
    color: '#aaa',
    marginTop: '20px',
    marginBottom: '12px',
    lineHeight: 1.2,
  },
  name: {
    fontSize: '20px',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    margin: 0,
    marginBottom: '12px',
    lineHeight: 1.2,
    color: '#fff',
  },
  price: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    paddingBottom: '60px',
    lineHeight: 1.2,
  },
};

export default ProductCard;
