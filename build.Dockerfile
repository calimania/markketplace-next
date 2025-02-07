FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
