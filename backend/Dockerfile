FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/profiles uploads/farms uploads/fields uploads/crops uploads/products

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]
