import React from "react";
import products from "../../data/products";
import ProductGrid from "../../components/product/ProductGrid";

const Product = ({ path, navigate }) => {
  const id = path.split("/").pop();
  const product = products.find((p) => p.id.toString() === id);

  if (!product)
    return (
      <div style={{ padding: "80px", color: "#fff" }}>Product not found</div>
    );

  // ---- Related products logic ----
  const related = products
    .filter((p) => p.id !== product.id) // exclude current product
    .filter(
      (p) =>
        p.brand === product.brand ||
        p.type === product.type
    );

  // Fill up to 4 products
  let suggested = [...related];

  if (suggested.length < 4) {
    // Get products not already in suggested
    const remaining = products.filter(
      (p) => p.id !== product.id && !suggested.includes(p)
    );
    while (suggested.length < 4 && remaining.length > 0) {
      const randIndex = Math.floor(Math.random() * remaining.length);
      suggested.push(remaining[randIndex]);
      remaining.splice(randIndex, 1);
    }
  } else {
    // Just take first 4 if more than 4
    suggested = suggested.slice(0, 4);
  }

  return (
    <div style={styles.container}>
      {/* Main product section */}
      <div style={styles.main}>
        <div style={styles.imageWrapper}>
          <img
            src={product.image || "https://via.placeholder.com/600x800"}
            alt={product.name}
            style={styles.image}
          />
        </div>

        <div style={styles.info}>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.brand}>{product.brand}</p>
          <p style={styles.price}>${product.price}</p>
          <div style={styles.rating}>⭐⭐⭐⭐☆</div>
          <p style={styles.description}>
            {product.description ||
              "This is a placeholder product description."}
          </p>
          <div style={styles.markers}>
            <span>🌱 Organic</span> | <span>♻️ Sustainable</span>
          </div>
          <button style={styles.cartButton}>Add to Cart</button>
        </div>
      </div>

      {/* You might also like section */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ marginBottom: "24px" }}>You might also like</h2>
        <ProductGrid products={suggested} navigate={navigate} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    color: "#fff",
    padding: "0 80px 80px 80px",
  },
  main: {
    display: "flex",
    gap: "40px",
  },
  imageWrapper: {
    flex: 1,
    padding: "0 80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    boxSizing: "border-box",
    backgroundColor: "#222",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  info: {
    flex: 1,
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "#111",
    boxSizing: "border-box",
  },
  name: { fontSize: "2rem", marginBottom: "16px" },
  brand: { color: "#aaa", marginBottom: "8px" },
  price: { fontWeight: 600, marginBottom: "16px", fontSize: "1.5rem" },
  rating: { marginBottom: "16px", fontSize: "1.2rem" },
  description: { marginBottom: "16px", lineHeight: 1.5 },
  markers: { marginBottom: "32px", color: "#4caf50", fontSize: "1rem" },
  cartButton: {
    padding: "15px 30px",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "0.3s",
  },
};

export default Product;