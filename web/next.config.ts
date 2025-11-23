/* eslint-disable indent */
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import type { NextConfig } from "next";
import * as path from "node:path";

const cwd = process.cwd();

library.add(fab);

const nextConfig: NextConfig = {
  "turbopack": {
    "root": path.join(cwd, "..")
  },
  "env": {
    "NEXT_PUBLIC_NODE_ENV": process.env.NODE_ENV
  }
};

export default nextConfig;
