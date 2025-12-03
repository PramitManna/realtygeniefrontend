"use client";
import { useEffect } from "react";

export default function GoogleMapsLoader() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!document.querySelector("#google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return null;
}
