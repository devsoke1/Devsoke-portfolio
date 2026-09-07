import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Devsoke",
    short_name: "Devsoke",
    description: "Software websites, apps, AI workflows and dashboards by Devsoke.",
    start_url: "/",
    display: "standalone",
    background_color: "#111114",
    theme_color: "#111114",
    icons: [
      {
        src: "/brand/devsoke-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/devsoke-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
