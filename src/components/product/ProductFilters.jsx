const ProductFilters = ({ filters, setFilters, brands, types }) => {
  const update = (key, value) =>
    setFilters({ ...filters, [key]: value || null });

  return (
    <>
      <select onChange={(e) => update("type", e.target.value)}>
        <option value="">Product type</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select onChange={(e) => update("price", e.target.value)}>
        <option value="">Price</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select onChange={(e) => update("brand", e.target.value)}>
        <option value="">Brand</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <select onChange={(e) => update("category", e.target.value)}>
        <option value="">Category</option>
        <option value="new">Newest arrivals</option>
        <option value="popular">Most popular</option>
      </select>
    </>
  );
};

export default ProductFilters;
