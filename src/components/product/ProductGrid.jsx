import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, navigate, searchQuery }) => {
  if (products.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h2 style={styles.emptyTitle}>
          {searchQuery ? "No products found" : "No products match your filters"}
        </h2>
        <p style={styles.emptyText}>
          {searchQuery 
            ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or browse our catalogue.`
            : "Try adjusting your filters to see more products."}
        </p>
        {searchQuery && (
          <button
            onClick={() => navigate('/catalogue')}
            style={styles.browseButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.borderRadius = '0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderRadius = '0';
            }}
          >
            Browse Catalogue
          </button>
        )}
      </div>
    );
  }

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
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "120px 40px",
    textAlign: "center",
  },
  emptyIcon: {
    color: "rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "32px",
  },
  emptyTitle: {
    fontSize: "1.8rem",
    fontWeight: 600,
    color: "#fff",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
  },
  emptyText: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.6)",
    margin: "0 0 32px 0",
    maxWidth: "500px",
    lineHeight: 1.6,
  },
  browseButton: {
    backgroundColor: "#ffffff",
    color: "#000",
    border: "none",
    padding: "14px 32px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 0,
    transition: "all 0.2s ease",
  },
};

export default ProductGrid;