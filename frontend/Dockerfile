# Use Node.js base image
FROM node:16

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the app
RUN npm run build

# Serve the app using a static file server
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
