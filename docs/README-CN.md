<p align="center">
<img width="40%" src="https://static.yinzhuoei.com/typecho/2022/02/17/048881447338917/WX20220217-212200-removebg-preview.png"/>
</p>


## Sword.js

[中文文档](https://www.yuque.com/mlgrgm/lrf0ra/af4ngt) / [Unicloud平台](https://github.com/swordCodePractice/sword-framework/tree/master/docs/READEME-DCLOUD-CN.md)

这是 Sword 团队内部沉淀的第一个云函数框架，毫无疑问它完全是基于`TypeScript`开发的。除了 `framework` 核心程序之外，它为开发者提供了开箱即用的开发套件，使之能够开
发`serverless`应用像写普通的 nodejs 程序一样简单。你可以使用它开发各个厂商的 serverless 应用，比如AWS,Aliyun,Tencent,Dcloud...

## 特性

- ❤️ 完全拥抱`TypeScript`
- 🐮 支持跨平台: Server/阿里云/腾讯云/Cloudflare/AWS/Unicloud
- 🕷️ 基于文件系统的路由
- 🥷 开箱即用的开发套件
- 📖 TS运行时类型校验
- 📃 生成API文档，兼容markdown以及openapi3.0
- 😍 完全 Hook 的写法与设计

## 平台

| 平台     | 进度 |
| -------- | ---- |
| Server   | ✅   |
| Unicloud | ✅   |
| Woker    | ⚠️   |
| 阿里云   | ⚠️   |
| 腾讯云   | ⚠️   |
| AWS      | ⚠️   |

## 安装

```bash
npm i @swordjs/sword-framework
```

我们非常建议你将 cli 脚手架安装到全局，这样就能够方便的使用了。

```bash
npm i @swordjs/sword-framework-cli -g
```
## 初始化

你可以更方便的初始化一个项目，它的初始化功能是由 cli 提供的，模板是[从这里](https://github.com/swordCodePractice/sword-framework/tree/master/example)获取的。

```bash
sword init
```

## 使用

```bash
npm run dev

# or

npm run build
```


## 为什么要使用 Sword?

我们希望这款小框架是你手中的剑，它能够开箱即用，能够胜任你的大部分 serverless 开发场景，这款框架的实现难度很低，但是由于它的精心设计，使用的成本也非常低。而且它
可以无痛地让你在不同场景切换，只因为它的跨平台实现都是可插拔插件。

我相信，多说无用，只有尝试了才知道这款框架到底有多香，我准备了一个[在线 demo](https://stackblitz.com/edit/node-73ctyi?embed=1&file=src/index.ts&view=editor)，你可以在这里看到它的用法 ( 但是云端环境运行不了，肯定不是我的锅 😄 )。


同样的，你也可以关注我的[bilibili 频道](https://space.bilibili.com/257902802)，我会在频道里面更新这款框架的使用方法。

## 联系我们

<div style="display: flex;justify-content: flex-start;">
<img width="30%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/6f5b6587-8efe-400f-8fcb-f277892a9854.png" />
<img width="32%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/309debe7-7f2a-47ae-a415-875e5b1f4922.jpg"></img>
</div>

## 友情开源项目

<table><tbody>
      <tr><td style="text-align: center;"><a target="_blank" href="https://ext.dcloud.net.cn/plugin?id=271"><img width="80px" style="margin-top: 15px;" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/7ede4b51-1574-49b9-a84d-0ad8b8bf65a8.jpeg"></a>
      <p style="font-size: 14px;">秋云ucharts跨端图表库</p>
      </td>
</tr></tbody>
</table>

## 赞助

剑指题解团队不需要捐助，如何你觉得这个 repo 对你有用的话，你可以 star 支持一下我们，并且推广更多人使用 Sword。如果你真的想要赞助，那么就以我们的名义（剑指题解团
队）捐一笔款吧，你可以向[中国红十字会-在线捐助](https://mv.lingxi360.com/m/zjgw7x?utm_bccid=LXEhue1n)

## 我们的服务号

<div><img width="40%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/e4395033-d45f-4e3e-a930-78ff91c8db54.png" width="80%">
</div>
