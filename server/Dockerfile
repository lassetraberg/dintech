# Use node available from Docker Hub (has NPM included)
FROM node
# Create directory to hold application code, aka workdir
WORKDIR /app
# Install app dependencies (* copies both package and package-lock)
COPY package*.json ./
RUN npm install
# Bundle source code
COPY . .
# The app binds to port 3000
EXPOSE 3000
# Run the server
CMD ["node", "src/index.js"]