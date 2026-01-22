import { useState, useEffect } from 'react';
import Home from '../pages/Home/Home';
import Catalogue from '../pages/Catalogue/Catalogue';
import Product from '../pages/Product/Product';
import About from '../pages/About/About';
import BloomBox from '../pages/BloomBox/BloomBox';
import PurchaseHistory from '../pages/PurchaseHistory/PurchaseHistory';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import Login from '../pages/Auth/Login';
import SignUp from '../pages/Auth/SignUp';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Admin from '../pages/Admin/Admin';
import EditProfile from '../pages/Profile/EditProfile';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NotFound = () => <div>Page not found</div>;

const Router = () => {
  const [path, setPath] = useState(window.location.pathname + window.location.search);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to top whenever path changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
    // Scroll is handled by useEffect watching path changes
  };

  const renderPage = () => {
    // Extract pathname (without query params) for routing
    const pathname = path.split('?')[0];
    
    if (pathname === '/') return <Home key={path} navigate={navigate} />;
    if (pathname === '/about') return <About key={path} navigate={navigate} />;
    if (pathname === '/catalogue')
      return (
        <Catalogue key={path} navigate={navigate} searchQuery={searchQuery} />
      );
    if (path === '/bloombox')
      return <BloomBox key={path} navigate={navigate} />;
    if (path === '/cart') return <Cart key={path} navigate={navigate} />;
    if (path === '/checkout')
      return <Checkout key={path} navigate={navigate} />;
    if (path === '/purchase-history')
      return <PurchaseHistory key={path} navigate={navigate} />;
    if (path === '/login') return <Login key={path} navigate={navigate} />;
    if (path === '/signup') return <SignUp key={path} navigate={navigate} />;
    if (path === '/forgot-password') return <ForgotPassword key={path} navigate={navigate} />;
    if (path === '/admin') return <Admin key={path} navigate={navigate} />;
    if (pathname === '/profile/edit') return <EditProfile key={path} navigate={navigate} />;
    // Match /product/:id
    if (path.startsWith('/product/'))
      return <Product key={path} path={path} navigate={navigate} />;

    return <NotFound key={path} />;
  };

  return (
    <>
      <Navbar navigate={navigate} setSearchQuery={setSearchQuery} />
      {renderPage()}
      <Footer navigate={navigate} />
    </>
  );
};

export default Router;
