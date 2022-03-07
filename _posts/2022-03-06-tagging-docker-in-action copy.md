---
title: "tagging docker in action"
date:   2022-03-06
tags:
  - tech
  - engineering practice
  - tips
published: false
---

今天, 我们就根据这篇[tagging docker]() 的理念来搭建一个简单的cdci.

你将会了解到:

1. build image with tag
2. build image and tag it by Jenkins
3. docker push
4. docker pull
5. docker run

之后, 我们会有一些简单的演练, 内容包括

1. install and run in a new environment
2. prepare for update
3. update quickly
4. roll back immediately

#### 准备
你需要事先拥有三样东西:
1. 一个 jenkins
2. 一个 gitlab/github 及其一段可编译运行的代码
3. 一个 docker repository

你需要事先做三件事:
1. 