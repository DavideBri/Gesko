---
title: "在Mac上配置多Git帐号"
date:   2021-07-14
tags:
  - git
  - tech
  - tips
---

如果你用SSH创建远程仓库的连接，就不再需要每次都输入帐号密码登录。但是如果你用的是HTTP协议创建远程仓库连接，那么无论如何都需要帐号密码创建连接。

#### 环境:
- GitHub account:
> jakob@github.com
- Gitlab account:
> jakob@company.com
- GitHub repo:
> git@github.com:jakob/projecta.git
- GItlab repo:
> git@company.com:jakob/projectb.git


#### 预计结果
Github 和 Gitlab 都能通过SSH 创建代码仓库的连接.

#### 步骤
1. cd `~/.ssh`.
2. 创建两个 ssh keys. 分别给 GitHub 和 Gitlab 使用.
> 注意: 请使用不同的命名或者路径. 在这个例子里，我会使用不同的名字. 分别是 ‘id\_rsa-jakob-github’ 和 ‘id\_rsa-jakob-company’

```bash
jakob@jakobMacBook-Air ~/.ssh> ssh-keygen -t rsa -b 4096 -C "jakob@github.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/jakob/.ssh/id_rsa): id_rsa-jakob-github
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in id_rsa-jakob-github.
Your public key has been saved in id_rsa-jakob-github.pub.
The key fingerprint is:
SHA256:svaDXxH9ESO3roMm3LFHLtUEku9S+yqw2tXWvBO6MCw jakob@github.com
The key's randomart image is:
+---[RSA 4096]----+
|          ..o +  |
|          .o + + |
|          ... +  |
|           .o= . |
|      . S ooo.+  |
|       +.o.Xo+.  |
|      o.Eo%.Boo. |
|     ..oo*.*..o. |
|      .o+. .oo.. |
+----[SHA256]-----+
jakob@jakobMacBook-Air ~/.ssh> ssh-keygen -t rsa -b 4096 -C "jakob@company.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/jakob/.ssh/id_rsa): id_rsa-jakob-company
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in id_rsa-jakob-company.
Your public key has been saved in id_rsa-jakob-company.pub.
The key fingerprint is:
SHA256:Sj2letoPxqv+wqEh5ixUNKJwcSfejEpQF8zWDbHlGSs jakob@company.com
The key's randomart image is:
+---[RSA 4096]----+
|..o+=o++o        |
|.o.*+*.+.+       |
|o.+.+ E + .      |
|.. o   o o       |
|  o   . S        |
| .o ...+ .       |
|.+ . +o.=        |
|. o . o= o       |
| .   .+++..      |
+----[SHA256]-----+
```

3. 将两个SSH Key 添加到MAC 系统中
> 注意：你会用到定义SSH Key 时候所使用的 passphrase.

```bash
jakob@jakobMacBook-Air ~/.ssh> ssh-add ~/.ssh/id_rsa-jakob-github
Enter passphrase for /Users/jakob/.ssh/id_rsa-jakob-github:
Identity added: /Users/jakob/.ssh/id_rsa-jakob-github (jakob@github.com)
jakob@jakobMacBook-Air ~/.ssh> ssh-add ~/.ssh/id_rsa-jakob-company
Enter passphrase for /Users/jakob/.ssh/id_rsa-jakob-company:
Identity added: /Users/jakob/.ssh/id_rsa-jakob-company (jakob@company.com)
```

`ssh-add` 只会把ssh key 加到你当前的terminal session 所以当你重启了terminal 就要重新添加，这很麻烦。所以你可以通过在 `~/.ssh/`添加一个config 文件， 让你的terminal 每次都能用到正确的 ssh key。

```bash
jakob@jakobMacBook-Air ~/.ssh>touch config
jakob@jakobMacBook-Air ~/.ssh>vim config
```
```text
HOST github.com
 User git
 Hostname github.com
 PreferredAuthentications publickey
 IdentityFile ~/.ssh/id_rsa-jakob-github

HOST company.com
 User git
 Hostname company.com
 PreferredAuthentications publickey
 IdentityFile ~/.ssh/id_rsa-jakob-company
```

4. 将 public key 的内容设置到 GitHub 和 GitLab 后台

```bash
jakob@jakobMacBook-Air ~/.ssh> cat id_rsa-jakob-github.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDqv8vGqmJTInHvOtdslumLwR860il+v/CyD4kK6aK4YSaekHpev3Qx8FmbXX7rZ6+0i5/LHI7epoBcsrjLhWd+Snnw0D3R3cb3/gwbopcsNCvJf1Oi8ZvOqAOTMcW+nC26gmTcJ2gDRNMnC7IAYzOGttGQgm3YWFGN9Vt2o7shNk+haWc0UDUqL7IVPidD61q7oMu0013MNgLZmdtHnkDH+8WuivpcJTGLGMGNxUFr8z1rhuJnmgZk9W8rhvczYsT2JY/97xyV6Zfdv8BK5xbJgN/DdirKjmgTFdCaJSa3TUnuj4Krvfu4ID2ZR8/Sdpk9dX3lItup7LK/bTL8C9TnGDES0JUY1oiHH7HP29D1mrnjjMnRli7Qmezw0ndB77oQVv9YUqSz8R5J6h58ZGUjgp0hTt4YBR5sTDlrU5W/7UcmfGwQRod0VQ5xyDb6VS6L2bL9RkIWJEWR6YgENYk8/Htz5s4s4K5cbNMCFAJIjcGjJ7MrJfoy+JHo3xZIAbYAW1lZk2PvYmwwb73ahXgEEBSjIf47j89a5c7o7vkBZ8AKjSqLC6acGfKJmFAXEUDa1lPTHfxrtYsXIWP9fdtO76wqWihYodGsm7FwQRPh/hR/acz7jfbYXliIvTxa/BLB61jARthKL8Zi+r4ftTYGiQ6iQrihg65nUFxl/isORQ== jakob@github.com
jakob@jakobMacBook-Air ~/.ssh> cat id_rsa-jakob-company.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDKMQjGVwbjrRD4RiuKksiRuon5IKu9d2yl/9n2vQObPCRnZAyUfqjSB5Ne3wnvNduz0AvpAOm4l0ZYLFComwrl+/Bg9UfrN/oODGWaSRcJNZoQH80UZ1HnseTWxN3ajrubooVbC2fNyMmufZG8B4GxrKLrHzXZgNBe7JGEUbPDsqsFenhrrCVv2Dbgx8+DvfALD+6mmssIbqSJ+P1+pBNVQEltk6yLiws2EzeDUCPktSsJ/TgUD/mH9SuG2VJNuoCvL6FT8y7jYyMWFiSLXIfY31fJDrnesXErDbN6dX+nFaZHjhtgu1oPmDDsgvpT2hm8dLE3bIqqC7877wznXGUNrekYmrsrOeqsWqhAnj0H0c8byKRuhq3AT7xeAueYTAaZUHcgsrWauimFMb2uAJ/pnPtcB8CXQQm5yGQVlHa0gwJ4s79zU+7/FCbTWAuD6NIfp4o7r2OiXY+2kB7M0Q/UmpxZ/HHRlTW55QYiD76N8qwKBTnp3n7UL4O9GSNj7P+xCRIDTdVejdfP9RpmrSdIUW433PVPMgiKGNVoWVCQX9JJUEbiTrhlpGHPXla3/goqBrCjbSvFEsPc7zrDVR2vWGJgTEg1gMZ9fWB6Y7p84y1+b9pERBwmxxspR+Qx19FoByn3VFxbs8q1rZTnxXAz4y64AW35ar2aeiFib9s/Uw== jakob@company.com
```

> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/github_config.jpg)
> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/gitlab_config.jpg)

#### 如何知道设置成功？
如果你遇到了错误，比如依旧需要帐号密码登录，或者无法pull push 代码，你可以检查git 设置：
```bash
jakob@jakobMacBook-Air ~/.ssh> git config --local --edit
[core]
        repositoryformatversion = 0
        filemode = true
        bare = false
        logallrefupdates = true
        ignorecase = true
        precomposeunicode = true
[remote "origin"]
        url = git@github.com:jakob/projecta.git
        fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
        remote = origin
        merge = refs/heads/master
```
Git 设置里的 `remote.url` 必须是一个SSH 格式的 URL `git@github.com:jakob/projecta.git`

#### 最后的话
最近终于用上了心仪已久的Macbook Air M1 版。为了ta，给ta配上了拓展坞，外置固态硬盘，显示器，让ta能尽其所能的工作。但是他只有245.11 GB 的储存空间，所以我必须很小心的安排每一寸土地。如果我用我旧的Macbook pro time-machine 来restore 这台macbook air，ta很快就会因为存储空间不足而变的很尴尬。所以我需要重新配置各种app，shell，brew 等等等等。。。

> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/my-eq.jpg)

：）