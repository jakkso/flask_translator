FROM node:10.15.1-alpine

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN npm install && npm install react-scripts@1.1.1 -g
COPY . /usr/src/app

CMD ["npm", "start"]
