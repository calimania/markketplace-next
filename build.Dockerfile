FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --global turbo
RUN npm ci --legacy-peer-deps

# Build arguments
ARG NEXT_PUBLIC_MARKKET_STORE_SLUG
ARG NEXT_PUBLIC_MARKKET_API
ARG NEXT_PUBLIC_MARKKETPLACE_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG MARKKET_API_KEY

# Env variables that will persist in the container
ENV NEXT_PUBLIC_MARKKET_STORE_SLUG=${NEXT_PUBLIC_MARKKET_STORE_SLUG}
ENV NEXT_PUBLIC_MARKKET_API=${NEXT_PUBLIC_MARKKET_API}
ENV NEXT_PUBLIC_MARKKETPLACE_URL=${NEXT_PUBLIC_MARKKETPLACE_URL}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}
ENV MARKKET_API_KEY=${MARKKET_API_KEY}
ENV NODE_ENV=production

# Copy rest of the application
COPY . .

# Build the application
RUN turbo build

# Expose the port
EXPOSE 3000
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

