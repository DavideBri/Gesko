---
title: "Spring Security Client Stateless"
date:   2020-09-22
tags:
  - java
  - spring
---

### Background

时代的产物 spring security (SS) Client 在默认情况下, 无法完全支持stateless 的系统设计.
许多设计依然沿用了session/ inmemory cache 的实现.
所以如果你准备在stateless 的系统中使用, 拥有, 占有, 坐享 spring security 带来的便利, 你必须重写一些Repository.

### 1. AuthorizationRequestRepository

Implementations of this interface are responsible for the persistence of {@link OAuth2AuthorizedClient Authorized Client(s)} between requests.

在Oauth 2.0 的许多次跳转中, SS 需要持久化并关联每一次的request, 包括, 第一次初始化oauth 2.0 的request 和最后登录成功(或者失败, 等等情况) 的request.
相关的实现便是AuthorizationRequestRepository 接口.

#### 1.1 HttpSessionOAuth2AuthorizationRequestRepository

默认情况下, AuthorizationRequestRepository 的实现就是HttpSessionOAuth2AuthorizationRequestRepository.
顾名思义, 这是一个基于Session 的实现. 
我们来看方法, saveAuthorizationRequest()
```java
@Override
public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request,
                                        HttpServletResponse response) {
    ......
    authorizationRequests.put(state, authorizationRequest);
    request.getSession().setAttribute(this.sessionAttributeName, authorizationRequests);
}
``` 

1. 逻辑可以说是很简单了, 在请求的时候保存request auth 过程中所需的信息, clientId, clientSecret, redirectUri, scopes, etc.
2. 在每次需要用到auth request 信息的时候, 都根据registrationId 获取.
3. 在登录成功之后删除这些信息.

#### 1.2 Make AuthorizationRequestRepository stateless.

要实现SS Client stateless , 我们需要的就是重写AuthorizationRequestRepository 接口, 让他支持分布式系统框架. 
换而言之, 每一次的http servlet request 都需要能找到与之关联的前一次(几次) 的http servlet request.
##### Options to implement:
> 1. Cookie based
> 2. JDBC(all kinds of persistence method) based
> 3. Spring Session Framework based

##### 1.2.1 Cookie based

在SS github issue list 里, 已经有许多小伙伴有类似的诉求, 相信下一个版本的SS 就会支持.
[Provide Cookie implementation of AuthorizationRequestRepository](https://github.com/spring-projects/spring-security/issues/6374)

##### 1.2.2 Spring Session Framework based

[Spring Session](https://spring.io/projects/spring-session) 的诞生, 就是为了支持分布式系统之间共享session. 他的本质就是通过各种主流的方式持久化session.

> 1. Spring Session Data Redis
> 2. Spring Session JDBC
> 3. Spring Session Hazelcast
> 4. Spring Session MongoDB

Spring Session 的实现细节就是通过各种自定或默认的策略跟踪持久化的session, 并且在SessionRepositoryFilter 里对session 进行操作(增查改).
另外Spring Session 会有一个Scheduled Job 定期清理(删)过期Session.

### 2. OAuth2AuthorizedClientRepository

OAuth2AuthorizedClientRepository 与AuthorizationRequestRepository 的作用大同小异,  
只不过, 在真正实现的过程中, 猛然发现, AuthorizationRequest 对象里, 就已经包含了AuthorizedClient 所有信息. 所以在正确的实现和使用AuthorizationRequestRepository 的前提下, OAuth2AuthorizedClientRepository 并不是必要的.

### 3. sessionCreationPolicy

SS web builder 里, 需要定义session creation policy. 对于Stateless 的系统而言, 如果没有使用Spring Session Framework, 我们必须定义需要定义session creation policy 为`SessionCreationPolicy.STATELESS`.
而`SessionCreationPolicy.STATELESS` 就是指定**不**把SecurityContext 放在内存里. NullSecurityContextRepository, NullRequestCache 是一个没有实现的实现.
```java
if (sessionPolicy == SessionCreationPolicy.STATELESS) {
    contextRepo = BeanDefinitionBuilder
            .rootBeanDefinition(NullSecurityContextRepository.class);
}
```

```java
if (stateless) {
    http.setSharedObject(RequestCache.class, new NullRequestCache());
}
```

带来一个结果, 原本可以从内存里, 或者session 里直接拿到的任何信息, 都需要重新从request, persistence level, redis, 或者cookies 里重新获取.
听起来很恐怖有没有, 但是实际上在开发的过程中, 只要稍加注意, 这样的情况不会非常多, 也不复杂.

### The End

如果秉承着"do the right things" 的心态, 私以为, 用Spring Session 来支持所有的Session based repository 为最佳.
不过, 这类的实现必然会成为历史.

