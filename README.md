# photo

> A Vue.js and Muse-ui project

## Build Setup

``` bash
# install dependencies
npm install
cd ./server
npm install

# vue with hot reload at localhost:5000
npm run dev

# serve at localhost:5001
cd cd ./server
npm run start

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run e2e tests
npm run e2e

# run all tests
npm test
```
>## build in local with two server

1. cd to vue-album
2. npm run dev  // serve with hot reload at localhost:5000
3. cd /server
4. npm run start // serve  at localhost:5001
u can see in localhost:5000

but u need Chrome Browser [Allow-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi) to see it.

>## build in local with one server

1. cd to vue-album
2. npm run build
3. note off ./server/app.js this sentence --->  app.use(express.static(path.join(__dirname,'../dist')))
4. npm start.
u can see in localhost:5001

