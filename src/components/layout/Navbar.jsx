import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useCart } from "../../store/CartContext";
import { useProducts } from "../../store/ProductsContext";
import Search from "../ui/Search";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = ({ navigate, setSearchQuery }) => {
  const { user } = useAuth();
  const { getCartItemCount } = useCart();
  const { products } = useProducts();
  const [hidden, setHidden] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const lastScrollY = useRef(0);
  const profileRef = useRef(null);

  // --- scroll hide/show ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside or when user logs out
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    // If user is not logged in, close dropdown
    if (!user || typeof user !== 'object' || !user.id) {
      setShowProfileDropdown(false);
      return;
    }

    const handleClickOutside = (event) => {
      // Check if click is inside the profile container OR the dropdown
      const isInsideProfile = profileRef.current && profileRef.current.contains(event.target);
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      // Only close if click is outside both
      if (!isInsideProfile && !isInsideDropdown) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileDropdown, user]);

  // Build nav links - only show Admin if user is logged in AND is admin
  const navLinks = [
    { name: "Catalogue", path: "/catalogue" },
    { name: "About", path: "/about" },
  ];
  
  // Only add Admin link if user exists, has an id, and is an admin
  if (user && typeof user === 'object' && user.id && user.isAdmin === true) {
    navLinks.push({ name: "Admin", path: "/admin" });
  }

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      navigate("/");
    }
  };

  const handleSearch = (query) => {
    if (setSearchQuery) {
      setSearchQuery(query);
    }
  };

  const cartItemCount = getCartItemCount();

  return (
    <>
      <header
        style={{
          ...styles.navbar,
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        {/* LEFT */}
        <div style={styles.left} onClick={handleLogoClick}>
          <img src="/logo.png" alt="Bloom" style={styles.logo} />
        </div>

        {/* RIGHT */}
        <nav style={styles.right}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href="#"
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path);
              }}
            >
              {link.name}
            </a>
          ))}

          {/* Search */}
          <Search navigate={navigate} onSearch={handleSearch} products={products} />

          {/* Box SVG (BloomBox) */}
          <div
            style={styles.iconContainer}
            onClick={() => {
              if (!user || typeof user !== 'object' || !user.id) {
                navigate("/login");
              } else {
                navigate("/bloombox");
              }
            }}
            title="BloomBox"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </svg>
          </div>

          {/* Cart SVG */}
          <div
            style={styles.iconContainer}
            onClick={() => {
              if (!user || typeof user !== 'object' || !user.id) {
                navigate("/login");
              } else {
                navigate("/cart");
              }
            }}
            title="Cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span style={styles.badge}>{cartItemCount}</span>
            )}
          </div>

          {/* Profile or Sign In */}
          {user && typeof user === 'object' && user.id ? (
            <div
              ref={profileRef}
              style={styles.profileContainer}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  style={styles.profileImage}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/24?text=U';
                  }}
                />
              ) : (
                <div style={styles.profilePlaceholder} />
              )}
            </div>
          ) : (
            <button
              style={styles.signInButton}
              onClick={() => navigate("/login")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.borderRadius = '0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderRadius = '0';
              }}
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* Profile Dropdown - only show when user is logged in */}
      {showProfileDropdown && user && typeof user === 'object' && user.id ? (
        <div ref={dropdownRef} style={styles.dropdownWrapper}>
          <ProfileDropdown
            user={user}
            onClose={() => setShowProfileDropdown(false)}
            navigate={navigate}
          />
        </div>
      ) : null}
    </>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "32px 80px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
    transition: "transform 0.35s ease",
    cursor: "default",
  },
  left: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  logo: {
    height: "24px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  link: {
    fontSize: "1rem",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
  },
  iconContainer: {
    position: "relative",
    height: "24px",
    width: "24px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "#fff",
    color: "#000",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  profileContainer: {
    position: "relative",
    cursor: "pointer",
  },
  dropdownWrapper: {
    position: "fixed",
    top: "88px",
    right: "80px",
    zIndex: 1001,
  },
  profileImage: {
    height: "24px",
    width: "24px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profilePlaceholder: {
    height: "24px",
    width: "24px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
  },
  signInButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "8px 20px",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 0,
    transition: "all 0.2s ease",
  },
};

export default Navbar;
