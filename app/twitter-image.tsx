// Twitter card image — same visual as OG, so we re-export from opengraph-image.
// Next.js doesn't accept a re-exported `runtime` here, so set it explicitly to
// silence the build warning while keeping the same Node OG renderer.
export { default, size, contentType, alt } from "./opengraph-image";

export const runtime = "nodejs";
