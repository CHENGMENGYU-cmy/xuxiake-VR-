FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

EXPOSE 3001

CMD ["node", "dist/main.js"]
