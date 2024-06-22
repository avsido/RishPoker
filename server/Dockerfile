# use ofiicial node.js runtime as parent image:
FROM node:14

# set working directory inside container:
WORKDIR /usr/src/app

# copy package.json & package-lock.json to working directory:
COPY server/package*.json ./ 

# install dependencies:
RUN npm install

# copy server folder contents to the working directory:
COPY server/ .

# expose port app server is running on:
EXPOSE 8080 

# command to run server:
CMD ["node", "main.js"]
