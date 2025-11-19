import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-custom-nodes',
      configureServer(server) {
        server.middlewares.use('/customnodes', async (req, res, next) => {
          const url = req.url;
          // Strip the leading /customnodes from the URL to avoid duplication
          // req.url in a middleware mounted at /customnodes might or might not include the mount point depending on the framework, 
          // Parse URL to strip query parameters (like ?import)
          // req.url is relative to the middleware mount point in some setups, but let's be safe
          // We use a dummy base because req.url might be just a path
          const parsedUrl = new URL(url, 'http://localhost');
          const urlPath = parsedUrl.pathname;

          // Strip the leading /customnodes from the URL path to avoid duplication
          const relativePath = urlPath?.startsWith('/customnodes') ? urlPath.slice('/customnodes'.length) : urlPath;
          const filePath = path.join(__dirname, '../customnodes', relativePath || '');

          console.log(`[CustomNodes Middleware] Request: ${url}`);
          console.log(`[CustomNodes Middleware] Resolved Path: ${filePath}`);

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            console.log(`[CustomNodes Middleware] Serving file: ${filePath}`);

            if (filePath.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json');
              fs.createReadStream(filePath).pipe(res);
              return;
            }

            if (filePath.endsWith('.js')) {
              try {
                const result = await server.transformRequest(filePath);
                if (result) {
                  res.setHeader('Content-Type', 'application/javascript');
                  return res.end(result.code);
                }
              } catch (e) {
                console.error(`[CustomNodes Middleware] Transform error for ${filePath}:`, e);
                // Fallback to raw serve if transform fails, though likely it won't work in browser if imports are bare
              }
            }

            // Fallback for other files or failed transform
            if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');

            fs.createReadStream(filePath).pipe(res);
          } else {
            console.log(`[CustomNodes Middleware] File not found: ${filePath}`);
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})