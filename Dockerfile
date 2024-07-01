FROM node:18-alpine

WORKDIR /usr/app

COPY package.json yarn.lock tsconfig.json ./
COPY src ./src

#install packages post install will run tsc
RUN yarn

#expose port to listen on in container
EXPOSE 3000

CMD ["yarn","start"]