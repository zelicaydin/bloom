import React, { useState } from "react";

const Search = ({ navigate, onSearch, products }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Navigate to catalogue if not there
    if (window.location.pathname !== "/catalogue" && navigate) {
      navigate("/catalogue");
    }

    // Send query up to Router
    if (onSearch) {
      onSearch(value);
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