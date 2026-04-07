import type { NextConfig } from "next";
import { Rewrite } from "next/dist/lib/load-custom-routes";

import { parseBaseUrl } from "./env/parse";
let rewrites: undefined | (() => Promise<Rewrite[]>)

const { NODE_ENV, NEXT_PUBLIC_DEV_PROXY } = process.env
if (NODE_ENV === "development" && NEXT_PUBLIC_DEV_PROXY === "true") {
  const prefix = parseBaseUrl(process.env,true)
  rewrites = () => {
    return Promise.resolve([
      {
        source: prefix + "/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/:path*",
      },
    ])
  }
}
const nextConfig: NextConfig = {
  /* config options here */
  rewrites
};

export default nextConfig;
