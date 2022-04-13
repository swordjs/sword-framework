FROM node:16.14.2

# 复制文件到容器
ADD . /src/

# Create app directory
WORKDIR /src
RUN npm install --registry=https://registry.npm.taobao.org

# build
RUN npm run build

# clean
RUN npm prune --production

# move
RUN rm -rf /app \
    && mv /src/.sword /app/ \
    && mv /src/node_modules /app/ \
    && rm -rf /src

# ENV
ENV NODE_ENV production

EXPOSE 3000

WORKDIR /app
CMD node src/index.js
