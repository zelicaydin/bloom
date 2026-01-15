import React from "react";

const categories = [
  { id: 1, name: "Skincare", image: "/categories/cat1.png" },
  { id: 2, name: "Body Care", image: "/categories/cat2.png" },
  { id: 3, name: "Hair Care", image: "/categories/cat3.png" },
  { id: 4, name: "Wellness", image: "/categories/cat4.png" },
  { id: 5, name: "Candles", image: "/categories/cat5.png" },
  { id: 6, name: "Oils", image: "/categories/cat6.png" },
];

const Categories = () => {
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
                style={{
                  ...styles.card,
                  width: isTwoCardRow
                    ? "calc(50% - 60px)"
                    : "calc(100% - 160px)",
                  marginRight: isTwoCardRow && index === 0 ? "120px" : 0,
                  paddingTop: isSecondInTwoCardRow ? "120px" : 0,
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
                <h3 style={styles.cardTitle}>{cat.name}</h3>
              </div>
            );
          })}
        </div>
      ))}
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
  cardTitle: {
    marginTop: "32px",
    fontSize: "2rem",
    fontWeight: 500,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
};

export default Categories;
