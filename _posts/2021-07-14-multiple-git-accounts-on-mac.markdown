---
title: "Multiple Git Accounts on Mac"
date:   2021-07-14
tags:
  - git
  - tech
  - tips
---

If you use the SSH transport for connecting to remotes, it’s possible for you to have a key without a passphrase, which allows you to securely transfer data without typing in your username and password. However, this isn’t possible with the HTTP protocols – every connection needs a username and password.

#### Environment:
- one GitHub account:
> jakob@github.com
- one Gitlab account:
> jakob@company.com
- GitHub repo address:
> git@github.com:jakob/projecta.git
- GItlab repo address:
> git@company.com:jakob/projectb.git


#### Expected result
Both Github and Gitlab accounts are able to authorize by using ssh.
#### Steps
1. cd into `~/.ssh` folder.
2. generate two ssh keys. One is for GitHub and another is for Gitlab.
> Note: use different key name or different path for the generated files. In my case I will just use different name. In my case I will use different name ‘id\_rsa-jakob-github’ and ‘id\_rsa-jakob-company’

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

3. Add two keys to your system
> Note: you need to use the passphrase in previous step.

```bash
jakob@jakobMacBook-Air ~/.ssh> ssh-add ~/.ssh/id_rsa-jakob-github
Enter passphrase for /Users/jakob/.ssh/id_rsa-jakob-github:
Identity added: /Users/jakob/.ssh/id_rsa-jakob-github (jakob@github.com)
jakob@jakobMacBook-Air ~/.ssh> ssh-add ~/.ssh/id_rsa-jakob-company
Enter passphrase for /Users/jakob/.ssh/id_rsa-jakob-company:
Identity added: /Users/jakob/.ssh/id_rsa-jakob-company (jakob@company.com)
```

The `ssh-add` only put your ssh key in the cache. It means that everytime you restart the shell, you have to add again which is not as our expectation. So we have to add config file in the path `~/.ssh/`

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

4. Put public key content in your GitHub and GitLab account.

```bash
jakob@jakobMacBook-Air ~/.ssh> cat id_rsa-jakob-github.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDqv8vGqmJTInHvOtdslumLwR860il+v/CyD4kK6aK4YSaekHpev3Qx8FmbXX7rZ6+0i5/LHI7epoBcsrjLhWd+Snnw0D3R3cb3/gwbopcsNCvJf1Oi8ZvOqAOTMcW+nC26gmTcJ2gDRNMnC7IAYzOGttGQgm3YWFGN9Vt2o7shNk+haWc0UDUqL7IVPidD61q7oMu0013MNgLZmdtHnkDH+8WuivpcJTGLGMGNxUFr8z1rhuJnmgZk9W8rhvczYsT2JY/97xyV6Zfdv8BK5xbJgN/DdirKjmgTFdCaJSa3TUnuj4Krvfu4ID2ZR8/Sdpk9dX3lItup7LK/bTL8C9TnGDES0JUY1oiHH7HP29D1mrnjjMnRli7Qmezw0ndB77oQVv9YUqSz8R5J6h58ZGUjgp0hTt4YBR5sTDlrU5W/7UcmfGwQRod0VQ5xyDb6VS6L2bL9RkIWJEWR6YgENYk8/Htz5s4s4K5cbNMCFAJIjcGjJ7MrJfoy+JHo3xZIAbYAW1lZk2PvYmwwb73ahXgEEBSjIf47j89a5c7o7vkBZ8AKjSqLC6acGfKJmFAXEUDa1lPTHfxrtYsXIWP9fdtO76wqWihYodGsm7FwQRPh/hR/acz7jfbYXliIvTxa/BLB61jARthKL8Zi+r4ftTYGiQ6iQrihg65nUFxl/isORQ== jakob@github.com
jakob@jakobMacBook-Air ~/.ssh> cat id_rsa-jakob-company.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDKMQjGVwbjrRD4RiuKksiRuon5IKu9d2yl/9n2vQObPCRnZAyUfqjSB5Ne3wnvNduz0AvpAOm4l0ZYLFComwrl+/Bg9UfrN/oODGWaSRcJNZoQH80UZ1HnseTWxN3ajrubooVbC2fNyMmufZG8B4GxrKLrHzXZgNBe7JGEUbPDsqsFenhrrCVv2Dbgx8+DvfALD+6mmssIbqSJ+P1+pBNVQEltk6yLiws2EzeDUCPktSsJ/TgUD/mH9SuG2VJNuoCvL6FT8y7jYyMWFiSLXIfY31fJDrnesXErDbN6dX+nFaZHjhtgu1oPmDDsgvpT2hm8dLE3bIqqC7877wznXGUNrekYmrsrOeqsWqhAnj0H0c8byKRuhq3AT7xeAueYTAaZUHcgsrWauimFMb2uAJ/pnPtcB8CXQQm5yGQVlHa0gwJ4s79zU+7/FCbTWAuD6NIfp4o7r2OiXY+2kB7M0Q/UmpxZ/HHRlTW55QYiD76N8qwKBTnp3n7UL4O9GSNj7P+xCRIDTdVejdfP9RpmrSdIUW433PVPMgiKGNVoWVCQX9JJUEbiTrhlpGHPXla3/goqBrCjbSvFEsPc7zrDVR2vWGJgTEg1gMZ9fWB6Y7p84y1+b9pERBwmxxspR+Qx19FoByn3VFxbs8q1rZTnxXAz4y64AW35ar2aeiFib9s/Uw== jakob@company.com
```

> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/github_config.jpg)
> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/gitlab_config.jpg)

#### How to debug
If you failed to pull or push or you still need to key in the username and password, make sure your project config are correctly configed ssh url.
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
the `remote.url` should using ssh url which is like `git@github.com:jakob/projecta.git`

#### In the end
Recently I got new Macbook air. I got external hard drives, monitors, and docking stations to show off the Macbook's characteristics as much as possible. However, it has only 245.11 GB storage. I have to arrange the storage very carefully. Using my old Macbook pro time-machine backups is not a good options. So I have to re-install all apps and configurations include git.

> ![Image]({{ site.url }}/images/post_images/2021-07-14-multiple-git-accounts-on-mac/my-eq.jpg)

:)