import type { NextConfig } from "next";

// The pictures and clips were renamed so their file names say what they show
// (fpv, dronefilm, Frolov ...). Old addresses keep working and point search engines on.
const renamed: Record<string, string> = {
  "/intro-4.mp4": "/video/fpv-drone-dronefilm-frolov-fpv-intro.mp4",
  "/intro-4-720.mp4": "/video/fpv-drone-dronefilm-frolov-fpv-intro-720p.mp4",
  "/intro-4.jpg": "/billeder/fpv-drone-dronefilm-frolov-fpv-intro.jpg",
  "/clips/pande-ram.mp4": "/video/fpv-dronefilm-panoram-dansk-natur.mp4",
  "/clips/pande-ram-720.mp4": "/video/fpv-dronefilm-panoram-dansk-natur-720p.mp4",
  "/clips/pande-ram.jpg": "/billeder/fpv-dronefilm-panoram-dansk-natur.jpg",
  "/clips/testkorsel.mp4": "/video/fpv-drone-bilvideo-testkoersel.mp4",
  "/projekter/pande-ram.jpg": "/billeder/fpv-dronefilm-panoram-dansk-natur-ramme.jpg",
  "/projekter/testkorsel.jpg": "/billeder/fpv-drone-bilvideo-testkoersel.jpg",
  "/images/portrait-fpv.jpg": "/billeder/peter-frolov-fpv-dronepilot.jpg",
  "/images/kat-logo-tiger.png": "/billeder/frolov-fpv-logo.png",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(renamed).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
