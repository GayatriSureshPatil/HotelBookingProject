FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start Vite dev server accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
