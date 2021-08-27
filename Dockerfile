# syntax=docker/dockerfile:1

FROM node:14

# Setting Node Env to development since it is for test purpose
ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

# Copy source code now, since we have our environment ready with installing the dependencies
COPY . .

EXPOSE 8080

CMD ["npm", "start", "http-server -p 8080"]
