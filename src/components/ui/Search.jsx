import React, { useState, useEffect } from "react";

const Search = ({ navigate, setSearchQuery }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Update search query in Router whenever query changes
    if (setSearchQuery) {
      setSearchQuery(query);
    }
  }, [query, setSearchQuery]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Navigate to catalogue if not there
    if (window.location.pathname !== "/catalogue") {
      navigate("/catalogue");
    }
  };

  return (
    <input
      type="text"
      placeholder="Search"
      value={query}
      onChange={handleChange}
      style={styles.input}
    />
  );
};

const styles = {
  input: {
    background: "rgba(44, 44, 44, 1)",
    border: "none",
    outline: "none",
    color: "#fff",
    padding: "8px 14px",
    fontSize: "16px",
    width: "160px",
  },
};

export default Search;