FROM node:16-alpine
# RUN apt-get update
# RUN apt-get -y install redis-server
# RUN apt -y install nodejs
WORKDIR /app

COPY package*.json ./
COPY . /app
# RUN npm install -g yarn
RUN yarn install

EXPOSE 80

CMD ["yarn","product"]