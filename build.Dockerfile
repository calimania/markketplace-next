FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --global turbo
RUN npm ci --legacy-peer-deps

ENV NODE_ENV="production"
ENV NEXT_PUBLIC_POSTHOG_ID=${NEXT_PUBLIC_POSTHOG_ID}
ENV NEXT_PUBLIC_MARKKET_STORE_SLUG=${NEXT_PUBLIC_MARKKET_STORE_SLUG}
ENV NEXT_PUBLIC_MARKKET_API=${NEXT_PUBLIC_MARKKET_API}
ENV NEXT_PUBLIC_MARKKETPLACE_URL=${NEXT_PUBLIC_MARKKETPLACE_URL}

# Copy rest of the application
COPY . .

# Build the application
RUN turbo build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

