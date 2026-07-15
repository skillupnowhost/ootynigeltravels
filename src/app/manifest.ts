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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
