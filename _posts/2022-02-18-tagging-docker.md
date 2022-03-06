---
title: "tagging docker"
date:   2022-02-18
tags:
  - tech
  - engineering practice
  - tips
published: true
---

你小子一旦开始用Docker, 在软件版本管理的过程中, 我劝你要重视Docker Tagging, 要很重视.

![Image]({{ site.url }}/images/post_images/2022-02-18-tagging-docker/0.jpeg)

以下, 是这些年以来, 大家总结的一些要点和实操经验.


#### 1. 定义一个方便自动化的版本定义规则
[语义化版本](https://semver.org/lang/zh-CN/) SemVer 是一种很棒的实操. 它是目前广泛使用的一种版本定义方法, 它定义了

- 主版本号：当你做了不兼容的 API 修改，
- 次版本号：当你做了向下兼容的功能性新增，
- 修订号：当你做了向下兼容的问题修正。

这种版本定义方法, 在公共的docker image 里使用广泛. 但是你的项目如果只是一个private docker image 时, 就大可不必使用SemVer 了, 因为在自动化的过程中, 这样的版本定义方式就不那么"智能"了.

什么是so called "智能"的版本定义呢? 我希望我的软件能够每次build 都发布, 每次发布都不用绞尽脑汁来思考这个版本的意义, 而且, 它还能迅速定位到我的代码版本. 最重要的是, 这是一系列的自动化机制.


#### 2. 你的容器里, 到底他妈的, 他妈的运行的是他妈的什么东西?!
无数次, 无数次, 当我问你, 现在运行的程序包括了什么内容? 你无数次的答不上来~ 问题出在哪呢?

问题出在了, 你无法根据docker tag 直接回溯到具体的代码版本.

当我们发布一个image 时, 理论上的顺序是

- code tag -> jenkins build -> docker push -> docker pull -> 运行的程序

那么回溯代码时, 就是发布的逆向

- 运行的程序 -> docker image -> code

如何能够迅速根据docker image 的信息回溯到代码呢?

答案是docker tag 一定要有git commit hash. 要达成回溯的目的, 这个docker tag 需要明确体现code commit 中的信息, 目前十分流行的方式是在docker tag 中加入commit hash. 即便是当我们在发布公共docker image 时, 我也强烈建议使用SemVer 加上commit hash 的方式来定义version.


#### 3. 一种健壮的版本定义
please define "健壮" 二字.

我不懂什么是"健壮", 但是我懂得什么是"不健壮", 一旦出现以下某一种现象, 我就认为它不够健壮.

1. 我们无法通过docker tag回溯当前运行的代码
2. 我们无法区分, docker image 里运行的是什么
3. 无法通过version 迅速rollback

三种"不健壮"的现象, 矛头都齐刷刷的指向了一件事

绝对, 绝对, 绝对**不要重复**使用同一个version number push docker image **!!!**

或许你们混淆了tagging different version 和 latest 的用法, 把所有的version number 都当作:latest 来用.


#### 4. the ":latest" tag?
相比具体的commit hash, ":latest" 显得那么抽象, 它是一个静态的定义, 确是一个动态的内容. 它的使用场景有限. 终端用户常常并不关心*过去的*版本, 他们只想要*最新*的版本, 当我发布一个公共的docker image 时, 我是需要去定义这个latest tag.

但是在日常开发时, ":latest" 就显得那么不可靠.


或许我能借助这篇博客安利你一种较为可靠的version 定义和 docker tagging practicing, 或许你有更好的建议能够实现健壮的版本管理, 请不要吝惜自己的字, 向我发来留言👇🏻️