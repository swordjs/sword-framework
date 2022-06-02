<p align="center">
<img width="40%" src="https://static.yinzhuoei.com/typecho/2022/02/17/048881447338917/WX20220217-212200-removebg-preview.png"/>
</p>

## Sword.js (for Unicloud)
> 面向高阶Typescript开发者的跨平台云函数框架, 我相信sword会是unicloud社区最独特也是最强的存在, 意味着unicloud的开发体验将从“ 🪓 石器时代” -> “ 💻 工业时代”

### 初来乍到, 简单介绍

[中文文档](https://www.yuque.com/mlgrgm/lrf0ra/af4ngt)

这是 Sword 团队内部沉淀的第一个云函数框架，毫无疑问它完全是基于`TypeScript`开发的。除了 `framework` 核心程序之外，它为开发者提供了开箱即用的开发套件，使之能够开
发`serverless`应用像写普通的 nodejs 程序一样简单。你可以使用它开发各个厂商的 serverless 应用，比如AWS,Aliyun,Tencent,**Dcloud (unicloud)** ...


### Dcloud-2022 插件大赛🎉

<img src="https://static.yinzhuoei.com/typecho/2022/05/17/010112482864668/WechatIMG11768.jpeg" />


### 特性

- ❤️ 完全拥抱`TypeScript`
- 🐮 支持跨平台: Server/阿里云/腾讯云/Cloudflare/AWS/**Unicloud**
- 🕷️ 基于文件系统的路由
- 🥷 开箱即用的开发套件
- 📖 TS运行时类型校验
- 📃 生成API文档，兼容markdown以及openapi3.0
- 😍 完全 Hook 的写法与设计


### 平台

| 平台     | 进度 |
| -------- | ---- |
| Server   | ✅   |
| **Unicloud** | ✅   |
| Woker    | ⚠️   |
| 阿里云   | ⚠️   |
| 腾讯云   | ⚠️   |
| AWS      | ⚠️   |

### 安装

```bash
npm i @sword-code-practice/sword-framework
```

我们非常建议你将 cli 脚手架安装到全局，这样就能够方便的使用了。

```bash
npm i @sword-code-practice/backend-cli -g
```
### 初始化

你可以更方便的初始化一个项目，它的初始化功能是由 cli 提供的，模板是[从这里](https://github.com/swordCodePractice/sword-framework/tree/master/example)获取的。

```bash
sword init
```

如果你初始化成功了🎉 , 那么就可以移步到这里, 查阅[unicloud入门教程](https://www.yuque.com/docs/share/61d05a31-d679-4672-8f45-f9f19681c6b8?#), 相信我, 你会很惊讶的! 如果你要深入学习swordjs在unicloud的开发姿势, 你需要熟悉一下[中文文档](https://www.yuque.com/mlgrgm/lrf0ra/af4ngt)




### 联系我们

<div style="display: flex;justify-content: flex-start;">
<img width="30%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/6f5b6587-8efe-400f-8fcb-f277892a9854.png" />
<img width="32%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/309debe7-7f2a-47ae-a415-875e5b1f4922.jpg"></img>
</div>

### 友情开源项目

<table><tbody>
      <tr><td style="text-align: center;"><a target="_blank" href="https://ext.dcloud.net.cn/plugin?id=271"><img width="80px" style="margin-top: 15px;" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/7ede4b51-1574-49b9-a84d-0ad8b8bf65a8.jpeg"></a>
      <p style="font-size: 14px;">秋云ucharts跨端图表库</p>
      </td>
</tr></tbody>
</table>

### 赞助

剑指题解团队不需要捐助，如何你觉得这个 repo 对你有用的话，你可以 star 支持一下我们，并且推广更多人使用 Sword。如果你真的想要赞助，那么就以我们的名义（剑指题解团
队）捐一笔款吧，你可以向[中国红十字会-在线捐助](https://mv.lingxi360.com/m/zjgw7x?utm_bccid=LXEhue1n)

### 我们的服务号

<div><img width="40%" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-c7e81452-9d28-4486-bedc-5dbf7c8386a5/e4395033-d45f-4e3e-a930-78ff91c8db54.png" width="80%">
</div>
