import { useState, useEffect } from "react";
import Home from "../pages/Home/Home";
import Catalogue from "../pages/Catalogue/Catalogue";
import Product from "../pages/Product/Product"; // make sure import path is correct
import Navbar from "../components/layout/Navbar";

const About = () => <div>About page</div>; // placeholder
const NotFound = () => <div>Page not found</div>;

const Router = () => {
  const [path, setPath] = useState(window.location.pathname);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  const renderPage = () => {
    if (path === "/") return <Home key={path} navigate={navigate} />;
    if (path === "/about") return <About key={path} navigate={navigate} />;
    if (path === "/catalogue")
      return (
        <Catalogue
          key={path}
          navigate={navigate}
          searchQuery={searchQuery}
        />
      );
    // Match /product/:id
    if (path.startsWith("/product/"))
      return <Product key={path} path={path} navigate={navigate} />;

    return <NotFound key={path} />;
  };

  return (
    <>
      <Navbar navigate={navigate} setSearchQuery={setSearchQuery} />
      {renderPage()}
    </>
  );
};

export default Router;