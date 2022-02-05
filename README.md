# sword-function-framework

这是sword团队内部沉淀的第一个云函数框架，毫无疑问它完全是基于`TypeScript`开发的。除了framework核心程序之外，它为开发者提供了开箱即用的开发套件，使之能够开发云函数像写普通的nodejs程序一样简单。我在构建这个框架的时候，有意无意的参考了`Midway.js`以及`Nest.js`在生态/语法上的思路和代码风格。

## 特性
- 完全拥抱TypeScript
- 它是可以通过插件支持跨平台的，阿里云/腾讯云/Cloudflare/AWS/Unicloud
- 毫无疑问它非常“小”，非常适合Serverless云函数
- 优先云函数URL化
- 基于文件系统的路由
- 完全Hook，我的最爱，希望也是你们的最爱