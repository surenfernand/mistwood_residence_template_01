import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const emailAssetRoot = path.join(projectRoot, "server", "email-assets");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveEmailAsset(requestPath) {
  const rel = decodeURIComponent(requestPath || "/").replace(/\?.*$/, "");
  const trimmed = rel.replace(/^\/+/, "") || "index.html";
  const safe = path.normalize(trimmed).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(emailAssetRoot, safe);
  if (!full.startsWith(emailAssetRoot)) return null;
  return full;
}

function emailPreviewPlugin() {
  return {
    name: "mistwood-email-template-preview",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/dev/email-templates")) return next();
        const suffix = req.url.slice("/dev/email-templates".length) || "/";
        let filePath = resolveEmailAsset(suffix);
        if (!filePath) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }
        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, "index.html");
          }
          if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }
          const ext = path.extname(filePath).toLowerCase();
          res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
          fs.createReadStream(filePath).pipe(res);
        } catch {
          res.statusCode = 500;
          res.end("Could not load file");
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), emailPreviewPlugin()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
