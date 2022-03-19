---
title: "liquibase in action"
date:   2022-03-07
tags:
  - tech
  - engineering practice
  - tips
  - cdci
published: false
---

传统(2014年以前)的发布流程, 在数据库回滚上, 面临着不少挑战. 如何像维护代码一样维护数据库变更呢? 如何像回滚代码一样回滚数据库格式呢? 如何让数据库结构维护变得自动化呢? 如何迅速的区分不同环境数据库的版本呢? 如何让你的应用无缝切换各种类型的数据库呢? 你要的答案就是(liquibase)[https://liquibase.org/download?_ga=2.126857037.1104847303.1647178218-806759545.1647178218]

##### Track, version, and deploy database changes

#### background

in action 的内容里, 你将了解到:

1. 如何开始在自己的项目里使用liquibase
2. 把liquibase 变成项目组cdci 中的一个步骤
3. 平时开发过程中, 你会用到的best practice
4. 最后我们一起利用liquibas 回滚一次数据库把!

引入liquibase 之前, 你要知道的几件事~

1. liquibase 的工作机理其实很简单, 把所有数据库变更文本标准化, 这个文本是changelog, ta支持`XML, JSON, SQL or YAML` 的格式
2. 所谓的安装liquibase 其实就是安装/下载一个jar 包, 所以, 你可以在gradle, maven, ant, spring 里直接添加liquibase 的依赖或者bean, 放在需要ta执行的地方; 除此之外, 你也可以在电脑里安装这个命令行应用来运行; 当然, 如果你不想让ta污染代码, 你也可以选择使用docker 镜像的方式在cdci 里来执行ta
3. 社区版就能满足大部分人的需求, 如果要使用云端版本, 可以订阅pro, enterprise 的版本
4. 如果是一个年久失修的软件需要引入liquibase, 那么在开始的时候你需要做两件重要的事, 第一, 划分好第一个版本的changelog; 第二, 让团队成员明白, 了解, 体会到, 数据库的版本管理的重要性.

然后开始我们的准备工作粑

1. 选择一个liquibase 服务版本, 本文将使用社区版
2. 准备一个全新的项目, (click here)[https://github.com/leweii/liquibase-sandbox.git]
3. 选择一个changelog 格式, 本文将采用YAML

关于第三点我多说一句, 如果你选择了SQL 格式的changelog, 那么请明白一件事, SQL 意味着将来变更数据库时, 无法完全做到无缝切换, 因为不同数据库如postgresql 和mysql 之间存在细微的SQL 语句差别.

#### 废话说完了, that's do it

