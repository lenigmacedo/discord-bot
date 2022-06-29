FROM node:16-alpine

RUN apk --no-cache add g++ libgcc libstdc++ linux-headers make python3 git curl unzip libc6-compat 

ENV NODE_ENV production

WORKDIR /home/node

COPY --chown=node:node . .

USER node

RUN npm i

CMD ["npm", "run", "bot"];
