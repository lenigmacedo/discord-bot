FROM node:16

WORKDIR /home/app

COPY . .

RUN npm i

CMD ["npm", "run", "bot"];