import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, navigate }) => {
  return (
    <div style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} navigate={navigate} />
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
};

export default ProductGrid;