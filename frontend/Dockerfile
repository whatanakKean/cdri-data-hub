# Step 1: Set the base image for the build
FROM node:18 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json ./
COPY package-lock.json ./

# Step 4: Install project dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the application
RUN npm run build

# Step 7: Set the base image for serving the built app
FROM nginx:alpine

# Step 8: Copy the build output to Nginx's default HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose port 80 for the frontend to be accessible
EXPOSE 80

# Step 10: Start Nginx
CMD ["nginx", "-g", "daemon off;"]
