---
title: "Work with RC API"
date:   2020-03-17
tags:
  - java
  - tech
---


If you are using RingCentral products, you can simply integrate RingCentral products with your ideas through RingCentral APIs.
In the first place, you need to register a developer account, and create a RingCentral APP.

>[RingCentral Developer Page](https://developers.ringcentral.com)

Sign in and click `create App`. You will see `Create App - General Settings` page.
Right after you finish this wizard, you will see this config page.

> ![Image]({{ site.url }}/images/post_images/2020-03-17-work-with-rc-api/pic1.jpg)

This is over view of your app.
In Application Credentials page, you can get auth info for your apps.

> ![Image]({{ site.url }}/images/post_images/2020-03-17-work-with-rc-api/pic2.jpg)

Now we have enough information to integrate RingCentral with your own ideas.
How about we build a simple App to get our Glip Messages. To realize this app you must assign the `read messages` permission in creating App step. Otherwise you will hit `no permission` exception.

>[source code](https://github.com/jakob-lewei/jakob-tool)

We have following things need todo. And we are going to use Java sdk for RingCentral to realize it.
1. build a connection.
2. Subscrip glip posts.

##### Build a connection.
```java
AppConfiguration loadConfiguration = YmlLoadHelper.loadConfiguration();
rc = new RestClient(client_id, client_secret, platform_url); // the id and key in screenshot above
rc.authorize(username, extension, password); // the account in 
```

##### Subscrip glip post.
```java
Subscription subscription = new Subscription(rc,
    new String[]{
            "/restapi/v1.0/glip/posts"
    },
    // do something with message
    LOG::info);
subscription.subscribe();
```

### Demo
1. Open your glip with the particular account in rc.authorize(username, extension, password);.
2. Build and start the application.
```shell
#> git clone https://github.com/jakob-lewei/jakob-tool.git
#> cd jakob-tool
#> gradle clean build
#> gradle platformSubscriptionMain
```

Now you can see all your messages in the log. You can do whatever you want for your Glip messages, store in some TODO list, key word scan, auto reply etc.

> ![Image]({{site.url}}/assets/post_images/2020-03-17-work-with-rc-api/pic3.jpg)
