import React from "react";

/**
 * No Suspense here on purpose.
 *
 * A boundary that renders immediately would flush the HTML shell — and its
 * `200 OK` status — before the community's existence is known, so a missing
 * community would answer 200 with a "not found" body. The dynamic segment's
 * layout already resolves the community before returning, which lets Next send
 * a real 404.
 */
function layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default layout;
