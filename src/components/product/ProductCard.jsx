import React from "react";

const ProductCard = ({ product, navigate }) => {
  const handleClick = () => {
    if (navigate) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <img
        src={product.image || "https://via.placeholder.com/400"} // placeholder if no image
        alt={product.name}
        style={styles.image}
      />
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.brand}>{product.brand}</p>
      <p style={styles.price}>${product.price}</p>
    </div>
  );
};

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    aspectRatio: "1", // square placeholder, adjust as needed
    objectFit: "cover",
    backgroundColor: "#222",
  },
  name: {
    fontSize: "1rem",
    fontWeight: 500,
    margin: "8px 0 4px",
  },
  brand: {
    fontSize: "0.875rem",
    color: "#aaa",
  },
  price: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginTop: "4px",
  },
};

export default ProductCard;