<p align="center">
<img width="40%" src="https://static.yinzhuoei.com/typecho/2022/02/17/048881447338917/WX20220217-212200-removebg-preview.png"/>
</p>


云函数开发框架的配套 CLI 开发套件,它是 sword 云函数框架的伴生工具

## 特性

- 🕷️ 自动编译 API&协议
- 🐯 使用超快的[Esbuild](https://github.com/evanw/esbuild) 捆绑生产程序
- 🐮 使用同样超快的 [Swc](https://swc.rs/) 编译开发程序
- 📦 创建预设模板
- 🪤 灵活的开发以及部署环境
- 📃 生成api文档
- 🧬 对框架 Runtime 作编译补全工作

## 命令

```bash
# 初始化项目
sword init
# 打包工程代码
sword build
# 启动打包后服务
sword serve
# 开发环境运行
sword dev
# 生成api文档
sword doc
```
