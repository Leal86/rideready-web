FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY index.html ./
COPY vite.config.js ./
COPY public ./public
COPY src ./src

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

RUN chown -R node:node /app/node_modules

USER node

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
