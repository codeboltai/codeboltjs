# syntax=docker/dockerfile:1

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY container_src/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY container_src/main.js ./

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "main.js"]