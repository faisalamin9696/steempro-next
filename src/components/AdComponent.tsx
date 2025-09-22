"use client";
import { useEffect } from "react";

export default function AdComponent() {
  useEffect(() => {
    try {
      (window["adsbygoogle"] = window?.["adsbygoogle"] || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-4510618528305465"
      data-ad-slot="4047688382"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
