import type { MetadataRoute } from "next";
import { site } from "@/lib/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Ooty Nigel",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f2",
    theme_color: "#0b3b2e",
    icons: [
      {
        src: "/images/brand/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/brand/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
