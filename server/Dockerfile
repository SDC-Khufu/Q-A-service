FROM node:10

WORKDIR /user/src/app

ENV PASSWORD=123456789 HOST="18.224.31.243"

COPY package*.json ./

RUN npm install

COPY . ./

# RUN make /app 
# //this line supose to make a container for us and any change in app would be automatically updated

EXPOSE 3555

CMD ["npm", "start"]