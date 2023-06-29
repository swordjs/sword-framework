---
id: unicloud
title: Unicloud
url: https://www.yuque.com/mlgrgm/lrf0ra/aczv45
---

unicloud作为sword支持的第一个serverless平台, 它必定有着独特的魅力, 我们一般在讨论serverless时, 都会围绕国内的阿里云和腾讯云讨论它们的优劣势, 但是unicloud的出现抹平了平台差异, 我们可以以极其小的代价去切换平台.
而且它和uniapp天生一对, 尤其在我们写uniapp时, 它往往能够数倍的提升开发效率, 在sword文档中的unicloud部分, 不仅会介绍sword for unicloud (后文简称**sfu**) , 还会带来unicloud开发的最佳姿势.

如果你不了解unicloud, 你可以先去 [unicloud (dcloud)](https://uniapp.dcloud.io/uniCloud/) 进行详细了解, 那么现在我们简单学习一下, sword是如何对unicloud进行支持的 <a name="FcclW"></a>

## 前言

unicloud支持uniapp内部函数调用, 也支持对公网暴露一个http服务 (一般称之为云函数url化) , 在sfu中我们通常会讨论内部调用的情况, 云函数url化我们将会单独提出做额外补充. 首先我们要知道, 我们的后端服务每一个模块都不可能单独去写一个云函数/模块, 所以我们需要一个路由框架去分发我们的逻辑! 实际上, 这种路由分发框架真的太简单了, 我相信任何一个nodejs新手都能非常轻松地开发出来, 也确实如此, 在dcloud插件市场中有很多云函数开发框架了, 比如[vk](https://ext.dcloud.net.cn/plugin?id=4157)

我们来看看vk主要实现了什么功能

1. 内置了很多开箱即用的功能, 比如uni-id等等
2. 集成了admin
3. 过滤器
4. 全面支持了云函数url化

目前从下载量和收藏量来评判, vk可以说是unicloud社区最流行的云函数开发框架, 而且作者非常用心地把框架和unicloud搭配的很好, 你在vk中可以轻松的使用二次封装的各种工具库, 对于开发unicloud函数小白来说非常的省时间 !
所以我用了一些篇幅讲vk, 是因为要引出我们的sfu:

1. sfu主要面向的用户是跨多端的serverless开发者, 它不与平台耦合
2. 而且你可以在sword中写出极具工程化的代码, 因为你可以天然使用Typescript
3. 优先esm
4. 极快的编译和打包速度
5. 非常安全的运行时校验参数

而且sfu是纯粹的, 不会封装官方的api, 因为这增加了学习成本且不利于切换serverless平台, 我们会提供多端通用的package去解决特定平台的问题
