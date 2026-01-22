import React from "react";

const TaglineSection = () => {
  return (
    <section style={styles.section}>
      <div style={styles.content}>
        <p style={styles.text}>
          Sustainability at every step, from careful sourcing to thoughtfully
          crafted beauty that nurtures both you and nature.
        </p>
      </div>

      <video
        style={styles.video}
        autoPlay
        muted
        loop
        playsInline
      >
        {/* Use environment variable for video URL, fallback to local file */}
        <source 
          src={import.meta.env.VITE_FOREST_VIDEO_URL || '/forest.mp4'} 
          type="video/mp4" 
        />
      </video>
    </section>
  );
};

const styles = {
  section: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#141414",
  },

  /* THIS defines the height */
  content: {
    position: "relative",
    padding: "160px 80px",
    zIndex: 1,
  },

  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.75,
    zIndex: 0,
  },

  text: {
    maxWidth: "1100px",
    fontSize: "64px",
    lineHeight: "1.05",
    letterSpacing: "-0.04em",
    fontWeight: 500,
    color: "#ffffff",
    margin: 0,
  },
};

export default TaglineSection;
