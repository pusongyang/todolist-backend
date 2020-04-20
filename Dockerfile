FROM node:10-jessie
#base 6u2 alios

ENV HOME /home/myhome/myapp

RUN mkdir -p /home/myhome/myapp/public
COPY . /home/myhome/myapp
COPY public /home/myhome/myapp/public/
COPY node_modules /home/myhome/myapp/node_modules/
WORKDIR /home/myhome/myapp/
ENTRYPOINT [ "node","index.js" ]
