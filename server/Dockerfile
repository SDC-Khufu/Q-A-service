FROM node:10

WORKDIR /user/src/app

COPY pakage*.json ./

RUN npm install

COPY . ./

RUN make /app

EXPOSE 3555

CMD ["npm", "start"]