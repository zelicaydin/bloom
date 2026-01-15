import { useState, useEffect } from "react";
import Home from "../pages/Home/Home";
import Catalogue from "../pages/Catalogue/Catalogue";
import Product from "../pages/Product/Product"; // make sure import path is correct
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Admin from "../pages/Admin/Admin";
import Navbar from "../components/layout/Navbar";

const About = () => <div>About page</div>; // placeholder
const NotFound = () => <div>Page not found</div>;

const Router = () => {
  const [path, setPath] = useState(window.location.pathname);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setPath(newPath);
      // Scroll to top when navigating back/forward
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Clear search when navigating away from catalogue
  useEffect(() => {
    if (path !== "/catalogue") {
      setSearchQuery("");
    }
  }, [path]);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    if (path === "/") return <Home key={path} navigate={navigate} />;
    if (path === "/about") return <About key={path} navigate={navigate} />;
    if (path === "/login") return <Login key={path} navigate={navigate} />;
    if (path === "/signup") return <SignUp key={path} navigate={navigate} />;
    if (path === "/cart") return <Cart key={path} navigate={navigate} />;
    if (path === "/checkout") return <Checkout key={path} navigate={navigate} />;
    if (path === "/admin") return <Admin key={path} navigate={navigate} />;
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