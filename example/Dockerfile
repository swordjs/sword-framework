FROM node:16.14.2

# RUN npm config set registry https://registry.npm.taobao.org/

# npm install
# 复制package.json文件
COPY package.json /src/
WORKDIR /src
# 淘宝镜像
RUN npm --registry=https://registry.npm.taobao.org install

# build
COPY . /src
RUN npm run build

# clean
RUN npm prune --production

# move
RUN rm -rf /src

# ENV
ENV NODE_ENV production

EXPOSE 3000

WORKDIR /app
CMD node index.js
