import React, { useState } from "react";

const Search = ({ navigate, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Navigate to catalogue if not there
    if (window.location.pathname !== "/catalogue") navigate("/catalogue");

    // Send query up to Router
    onSearch(value);
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