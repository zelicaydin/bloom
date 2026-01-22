const Hero = () => {
  // Use environment variable for video URL, fallback to local file
  const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL || '/hero.mp4';
  
  return (
    <section style={styles.hero}>
      <video
        style={styles.video}
        src={heroVideoUrl}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Bottom overlay box with gradient */}
      <div style={styles.overlayBox}>
        <div style={styles.overlayContent}>
          {/* Flourish image */}
          <img
            src="/public/flourish.png"
            alt="Flourish"
            style={styles.flourish}
          />

          {/* Hero text */}
          <h1 style={styles.overlayText}>
            With sustainable products crafted for your glow.
          </h1>
        </div>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },

  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  overlayBox: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: "80px 80px 60px 80px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
    background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))",
  },

  overlayContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  flourish: {
    marginBottom: "40px", // spacing between image and text
    width: "508px", // keep natural width
    height: "auto", // scale proportionally
    maxWidth: "1000px", // optional, limit size
  },

  overlayText: {
    fontSize: "2rem",
    fontWeight: "400",
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.05em",
  },
};

export default Hero;
