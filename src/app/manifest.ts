import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AMOPS - Eielson Airfield Management",
    short_name: "AMOPS",
    description: "Eielson AFB Airfield Management Operations tools",
    start_url: "/",
    display: "standalone",
    background_color: "#333333",
    theme_color: "#333333",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
