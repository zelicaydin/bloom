import React from "react";

const categories = [
  { 
    id: 1, 
    name: "Newest Arrivals", 
    description: "Discover our latest sustainable beauty products",
    image: "/categories/cat1.png", 
    categoryFilter: "new" 
  },
  { 
    id: 2, 
    name: "Most Popular", 
    description: "Shop our bestsellers loved by the Bloom community",
    image: "/categories/cat2.png", 
    categoryFilter: "popular" 
  },
  { 
    id: 3, 
    name: "Best Reviewed", 
    description: "Top-rated products with outstanding customer feedback",
    image: "/categories/cat3.png", 
    categoryFilter: "bestReviewed" 
  },
  { 
    id: 4, 
    name: "Sustainable", 
    description: "Products with the highest sustainability credentials",
    image: "/categories/cat4.png", 
    categoryFilter: "sustainable" 
  },
  { 
    id: 5, 
    name: "Cheapest", 
    description: "Affordable options without compromising on quality",
    image: "/categories/cat5.png", 
    categoryFilter: "cheapest" 
  },
  { 
    id: 6, 
    name: "Premium", 
    description: "Luxury products crafted with exceptional ingredients",
    image: "/categories/cat6.png", 
    categoryFilter: "premium" 
  },
];

const Categories = ({ navigate }) => {
  const handleCategoryClick = (categoryFilter) => {
    if (navigate) {
      navigate(`/catalogue?category=${categoryFilter}`);
    }
  };
  const rows = [
    categories.slice(0, 2), // row 1: two cards
    categories.slice(2, 3), // row 2: single card
    categories.slice(3, 5), // row 3: two cards
    categories.slice(5, 6), // row 4: single card
  ];

  return (
    <section style={styles.section}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            width: "100%",
            marginBottom: "120px",
          }}
        >
          {row.map((cat, index) => {
            const isTwoCardRow = row.length === 2;
            const isSecondInTwoCardRow = isTwoCardRow && index === 1;
            const isSingleCard = row.length === 1;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.categoryFilter)}
                style={{
                  ...styles.card,
                  width: isTwoCardRow
                    ? "calc(50% - 60px)"
                    : "calc(100% - 160px)",
                  marginRight: isTwoCardRow && index === 0 ? "120px" : 0,
                  paddingTop: isSecondInTwoCardRow ? "120px" : 0,
                  cursor: "pointer",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{
                    width: "100%",
                    height: "600px", // image fixed height
                    objectFit: "cover",
                  }}
                />
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{cat.name}</h3>
                  <p style={styles.cardDescription}>{cat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={styles.buttonContainer}>
        <button
          style={styles.catalogueButton}
          onClick={() => navigate('/catalogue')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderRadius = '0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderRadius = '0';
          }}
        >
          See Catalogue
        </button>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: "80px",
  },
  card: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    marginTop: "32px",
  },
  cardTitle: {
    fontSize: "2rem",
    fontWeight: 500,
    color: "#fff",
    letterSpacing: "-0.03em",
    margin: 0,
    marginBottom: "12px",
  },
  cardDescription: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
    margin: 0,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "80px",
  },
  catalogueButton: {
    backgroundColor: "#ffffff",
    color: "#000",
    border: "none",
    padding: "16px 40px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 0,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
};

export default Categories;
