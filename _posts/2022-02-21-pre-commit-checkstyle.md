---
title: "CheckStyle in Pre-Commit"
date:   2022-02-21
tags:
  - tech
  - engineering practice
  - git
  - tips
featured_image: /images/post_images/2022-02-21-pre-commit-checkstyle/0.png
---

养成编码习惯的第一步. checkstyle + precommit

- [checkstyle official site](https://checkstyle.sourceforge.io])
- [git hooks site](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

简单说,我们在每次`git commit` 时,都进行一次checkstyle.

个人而言,每当你敲下任何代码的时候,都会受到许多制约,就像开车时候,你需要受到交规制约一样,一个简单的转向灯,能够让周围的人明白你的意图

团队而言,所有不符合代码规范的代码,都完全无法进入到git 仓库,他们被挡在了个人电脑这个层级上.

#### guideline

1. 配置checkstyle 运行方式
2. 配置git hooks
3. 实现全团队checkstyle
3. 配置checkstyle 规则

#### 配置 checkstyle

选择自己希望运行的方式, checkstyle 支持命令行, gradle, maven, 或者是java -jar 的方式运行.

文章推荐使用gradle的方式, 不为什么, 就是因为配置简单.

关于gradle 配置的文档可以参考 [checkstyle in gradle](https://docs.gradle.org/current/userguide/checkstyle_plugin.html)


```json
plugins {
    id 'checkstyle'
}
```

默认情况, checkstyle plugin 会从特定路径下寻找配置文件, 默认路径如下:

```
<root>
└── config
    └── checkstyle           
        └── checkstyle.xml
        └── suppressions.xml
```
- Checkstyle configuration files -> checkstyle.xml
- Primary Checkstyle configuration file -> suppressions.xml

他们的规则我还没想好呢, 待会我们会提到, 我们先用一个简单的吧~

```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC "-//Puppy Crawl//DTD Check Configuration 1.3//EN" "http://checkstyle.sourceforge.net/dtds/configuration_1_3.dtd">
<module name="Checker">
    <property name="charset" value="UTF-8" />
      <module name="LineLength">
          <property name="max" value="120" />
          <property name="ignorePattern" value="^package.*|^import.*|a href|href|http://|https://|ftp://" />
      </module>
    </property>
</module>
```

👆🏻️顾名思义, 这个文件是在检查编码是否属于UTF-8, 并且单行不应该超过120个字符~
接下来, 我们就来到命令行里输入, 如果懒的自己搭, 可以用我现有的项目

```bash
git clone git@github.com:leweii/demo.git
./gradlew checkstyleMain
```

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/1.jpg)

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/2.jpg)

#### 配置git hooks

git hooks 本质是一系列shell脚本, 他会在git 各个阶段自动调用, 我们要做的就是定义自己的pre-commit 脚本, 让checkstyle 成为里面的一个步骤.

最快的做法是把example mv 过来.

```bash
mv .git/hooks/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

+ 通过git status 拿到所有改动的文件
+ 过滤出java 文件
+ 对每个文件checkstyle
+ 如果check 不通过, 则返回1, 通过返回0

这是我的pre-commit

```bash
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

# 一个打印函数，前后加空行
function print(){
    echo "===========$*============"
}

print 提高修养

wd=`pwd`
rm -f temp

is_err=0

re=`./gradlew checkstyleMain >> temp`
err=`cat temp | grep "ERROR"`
if [ $err = *"ERROR"* ];then
    print $err
    is_err=1
fi

print "检查完成"

rm -f temp

if [ $is_err -ne 0 ];
then
    print "请先符合style才能提交！"
    exit 1
fi

exit 0
```

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/3.jpg)

单单这样配置, 还是不够哦~ 因为hooks的目录是不会被git 同步, 那么我们要怎样把自己的checkstyle 共享给全团队呢?👇🏻️

#### 实现全团队checkstyle

通过`core.hooksPath` 来配置指定的hooks path.

simply->

```bash
git config core.hooksPath ./hooks
mv .git/hooks/pre-commit ./hooks/
```

这样团队里所有人都能通用一套checkstyle 辽~

#### 配置checkstyle 规则

这个纯粹就是文档功夫, 请参阅 [Checkers](https://checkstyle.sourceforge.io/checks.html).

举例子说明吧, 我今天想检查无用的import 和不应该出现的空格.

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/4.jpg)

依葫芦画瓢~, 在你的Checker 里加上.

```xml
<module name="TreeWalker">
        <module name="UnusedImports"/>
        <module name="WhitespaceAfter"/>
        <module name="WhitespaceAround">
            <property name="tokens"
              value="ASSIGN,DIV_ASSIGN,PLUS_ASSIGN,MINUS_ASSIGN,STAR_ASSIGN,
                     MOD_ASSIGN,SR_ASSIGN,BSR_ASSIGN,SL_ASSIGN,BXOR_ASSIGN,
                     BOR_ASSIGN,BAND_ASSIGN"/>
          </module>
    </module>
```

效果如下:

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/5.jpg)

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/6.jpg)

#### 最后, 一些问题总结

如果你看到这样的东东, 大概率是xml 文件定义错误了, 或者checkstyle 版本和xml 不对应.

要想debug 具体原因, 就可以打开 `--stacktrace`

```bash
gradle checkstyleMain --stacktrace
```

> ![Image]({{ site.url }}/images/post_images/2022-02-21-pre-commit-checkstyle/7.jpg)

-----

附录:
- download google checkstyle -> [checkstyle.xml](https://github.com/checkstyle/checkstyle/blob/master/src/main/resources/google_checks.xml)
- download sun checkstyle -> [checkstyle.xml](https://github.com/checkstyle/checkstyle/blob/master/src/main/resources/sun_checks.xml)
- download -> [suppressions.xml](https://github.com/checkstyle/checkstyle/blob/master/config/suppressions.xml)

因为以前cdci都是SED team小伙伴帮忙专门配置的, 自己胡乱按理论写了一通, 并没有实际验证过, 结果发现心里负担很重, 自己的博客还是需要负责任的验证再发布一遍, 之后推翻重写了一遍, 总算是心安了.