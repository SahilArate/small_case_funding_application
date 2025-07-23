# client/Dockerfile

# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS build-stage

# Set the working directory for the React app
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the React application code
COPY . .

# Build the React application
RUN npm run build

# --- Stage 2: Serve the React Application with Nginx ---
FROM nginx:alpine AS production-stage

# ✅ ADD THIS LINE: Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the 'build-stage' to Nginx's public directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default HTTP port)
EXPOSE 80

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
