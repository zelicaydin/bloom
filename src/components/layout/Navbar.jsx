import { useEffect, useRef, useState } from "react";
import Search from "../ui/Search";
import { useAuth } from "../../store/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = ({ navigate, setSearchQuery }) => { // <--- receive navigate and setSearchQuery from Router
  const { user } = useAuth();
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

  const navLinks = [
    { name: "Catalogue", path: "/catalogue" },
    { name: "About", path: "/about" },
  ];

  // Add admin link if user is admin
  if (user?.isAdmin) {
    navLinks.push({ name: "Admin", path: "/admin" });
  }

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/"); // use navigate from Router
    }
  };

  return (
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
            style={styles.link}
            onClick={() => navigate(link.path)} // use navigate
          >
            {link.name}
          </a>
        ))}

        {/* Pass navigate and setSearchQuery to Search */}
        <Search navigate={navigate} setSearchQuery={setSearchQuery} />

        {/* Cart SVG */}
        <div style={styles.icon} onClick={() => navigate("/cart")}>
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
        </div>

        {/* Box SVG */}
        <div style={styles.icon}>
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

        {/* Profile */}
        {user ? (
          <div style={styles.profileContainer} ref={profileRef}>
            <img
              src={user.photo}
              alt="Profile"
              style={styles.profileImage}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />
            {showProfileDropdown && (
              <ProfileDropdown
                user={user}
                onClose={() => setShowProfileDropdown(false)}
                navigate={navigate}
              />
            )}
          </div>
        ) : (
          <div
            style={styles.profile}
            onClick={() => navigate("/login")}
            title="Log in"
          />
        )}
      </nav>
    </header>
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
  left: { display: "flex", alignItems: "center", cursor: "pointer" },
  logo: { height: "24px" },
  right: { display: "flex", alignItems: "center", gap: "32px" },
  link: { fontSize: "1rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#fff", textDecoration: "none", cursor: "pointer" },
  icon: { height: "24px", width: "24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  profile: { height: "24px", width: "24px", background: "rgba(255,255,255,0.35)", cursor: "pointer", borderRadius: "50%" },
  profileContainer: { position: "relative", height: "24px", width: "24px", cursor: "pointer" },
  profileImage: { height: "24px", width: "24px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%" },
};

export default Navbar;