// Twitter card image — same visual as OG, so we re-export from opengraph-image.
// Next.js doesn't accept a re-exported `runtime` here, so set it explicitly to
// silence the build warning while keeping edge generation.
export { default, size, contentType, alt } from "./opengraph-image";

export const runtime = "edge";
