import { useState } from "react";
import SortBar from "./SortBar";
import ProductGrid from "../../components/product/ProductGrid";
import { useProducts } from "../../store/ProductsContext";

const Catalogue = ({ navigate, searchQuery }) => {
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState(products);

  return (
    <section style={styles.page}>
      {/* Sort / Filter Bar */}
      <SortBar
        searchQuery={searchQuery}
        products={products}
      >
        {(visibleProducts) => (
          <>
            <ProductGrid products={visibleProducts} navigate={navigate} />
          </>
        )}
      </SortBar>
    </section>
  );
};

const styles = {
  page: {
    paddingTop: "160px",
    paddingInline: "80px",
  },
};

export default Catalogue;