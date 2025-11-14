/* eslint-disable indent */
import type { NextConfig } from "next";
import * as path from "node:path";

const cwd = process.cwd();

const nextConfig: NextConfig = {
  "turbopack": {
    "root": path.join(cwd, "..")
  }
};

export default nextConfig;
