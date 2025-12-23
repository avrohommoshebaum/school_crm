# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Copy server code (public/ folder should already be built and included)
COPY . .

# Expose port (Cloud Run sets PORT env var automatically)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

