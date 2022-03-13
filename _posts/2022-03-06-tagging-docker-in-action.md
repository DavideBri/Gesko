---
title: "Tagging Docker in Action"
date:   2022-03-06
tags:
  - tech
  - engineering practice
  - tips
---

今天, 我们就根据这篇[tagging docker](https://www.jakobhe.com/2022/02/18/tagging-docker) 的理念来搭建一个简单的pipeline. 让团队每天都在重复, 每天都在干的事情自动化.

这个pipeline 包括了

1. build
2. test
3. deploy

build 和deploy 的唯一区别就是tag 不一样. 举一反三后, 大家都能找到自己团队最适合的流程.

#### 准备
准备几样东西:

1. 一个 gitlab/github 及其一段可编译运行的代码👇🏻️

```bash
git@github.com:docker/getting-started.git
```

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/2.jpg)

2. 一个 docker repository 👇🏻️

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/1.jpg)

#### 开始!

##### 第一步 进入gitlab cdci editor 在 CI/CD > Editor, 创建一个新的cdci yaml 文件.

##### 第二步 选择一个分支, 或许对于我们的团队来说, 只有分支main/master 的代码需要打包发布, 而其它分支的代码我们只需要checkstyle 或者sonar scan.

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/3.jpg)

##### 第三步 定义每一步的工作内容吧

```yaml
image: docker:19.03.12

variables:
  CI_REGISTRY: docker.io
  CI_REGISTRY_IMAGE: index.docker.io/lewei/repo
  CONTAINER_TEST_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG.$CI_COMMIT_SHORT_SHA
  CONTAINER_RELEASE_IMAGE: $CI_REGISTRY_IMAGE:latest

services:
  - docker:19.03.12-dind

before_script:
  - docker info
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - echo "start build"
    - docker build -t $CONTAINER_TEST_IMAGE .
    - docker push $CONTAINER_TEST_IMAGE
    - echo "build done"

test:
  stage: test
  script:
    - echo "start test"
    - docker pull $CONTAINER_TEST_IMAGE
    # - docker run $CONTAINER_TEST_IMAGE /script/to/run/tests
    - echo "test done"

deploy:
  stage: deploy
  only:
    - main
    - master
  script:
    - echo "start deploy"
    - docker pull $CONTAINER_TEST_IMAGE
    - docker tag $CONTAINER_TEST_IMAGE $CONTAINER_RELEASE_IMAGE
    - docker push $CONTAINER_RELEASE_IMAGE
    # - ./deploy.sh
    - echo "deploy done"
```

大致意思就是, 这个pipeline 分了三步, 

- `1. build` 
- `2. test` 
- `3. deploy` 

具体配置细节下次我们再聊. 

先本地执行一下👇🏻️

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/4.jpg)

提交之后的一个执行效果👇🏻️

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/5.jpg)

然后我们发现, docker repo 被更新了 👇🏻️

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/6.jpg)

修改配置一下变量, 把你的帐号密码藏起来, 把你的docker repo 地址配置一下, 我用的是官方的repo 就如下配置啦.

```bash
CI_REGISTRY_USER: jakob
CI_REGISTRY_PASSWORD: password
```

几个要注意的地方

- docker tag 的方式因团队流程而定, 个人非常推荐测试环境以branch + commit short hash 的方式, 例子里的tag 就是`lewei/repo:main.5cff68f7` 
- 指定你的pipeline docker 版本, 例如 docker:19.03.12, 如果你坚持使用latest, 那么将来每次docker 的 docker image 升级, 你都在承担着风险
- 账户密码千万放在gitlab cdci pipeline 里, 放在变量里

![Image]({{ site.url }}/images/post_images/2022-03-06-tagging-docker-in-action/7.jpg)


#### 最后

对于所有的one time work, 我希望团队都是不遗余力的干, 鬼知道你提高了多少效率, 鬼知道别人赶着做的项目, 对你来说是那么的轻松, 还可以腾出时间写点博客啥的~

源码在这 [gitlab/leweii/tagging-docker-demo](https://gitlab.com/leweii/tagging-docker-demo.git)
