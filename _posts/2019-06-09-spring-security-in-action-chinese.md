---
title: "Spring Security 实战"
date:   2019-06-09
tags:
  - java
  - spring
  - tech
---

### **什么是Spring Security?**
Spring Security 是一个高度可定制的身份验证和访问控制的Java框架, 尤其是基于Spring框架的应用.它被广泛应用于Java程序开发.

### **为什么要使用Spring Security?**
Spring Security 与Spring Boot 之间有高度集成. Spring Security 支持多种认证模式。这些验证绝大多数都是要么由第三方提供，或由相关的标准组织开发。另外Spring Security 提供自己的一组认证功能。具体而言，Spring Security 目前支持所有这些技术集成的身份验证. 正如许多其它基于Spring开发的应用一样, 它最大的优点是它如此简单的拓展从而达到客户的需求.

### **Spring Security 实战**
在这个范例中, 我们将会练习如何搭建一个基础的Spring Security框架应用. 首先需要介绍的是四个最基本的类(HttpSecurity, WebSecurityConfigurer, UserDetailsService, AuthenticationManager). 到文末, 这个应用将具备以下特性.
1. 用户名密码验证.
2. 权限控制.
3. token 分发.
4. token 验证 - 使用 JWT 验证.
5. 密码加密.

> ![spring-security-scope.jpg]({{ site.url }}/assets/post_images/2019-04-09-spring-security-in-action/pic1.png)

在这些特性的实现的过程中, 我们也许能借此了解到一些Spring Security的基本原理.

#### I. 添加依赖 
```sh
compile "org.springframework.boot:spring-boot-starter-security"
```

#### II. 分发Token
Token 分发的第一步骤, 需要定义该如何生成Token. 众所周知, 在行业内有 "password", "authorization_code", "implicit", "client_credentials" 四种常见的方式. 在范例中, 我们使用"password" 方式.
```java
@Override
public void configure(ClientDetailsServiceConfigurer configurer) throws Exception {
    configurer
            .inMemory()//jdbc()
            .withClient(clientId)
            .secret(passwordEncoder.encode(clientSecret))
            .authorizedGrantTypes("password")
            .scopes("read", "write")
            .resourceIds(resourceIds);
}
```

这种使用in memory的方式保存账号密码并不常见, 在正式环境, 我们通常是从数据库读取, 配置如下:
```java
configurer.jdbc()
```

接下来, 我们需要定义对Token 的一些配置, 包括: 
1. Token 颁发
2. Token 转换
3. Token 管理 
4. Token 验证的后续操作

在这个范例中, 我们将会使用JWT 来管理Token.

#### III. Token 验证
现在, 我们可以着手开始实现我们的验证机制. 一个比较流行的方法是继承与WebSecurityConfigurerAdapter并且根据自己的需求重写控制器的方法, 如下.
1. passwordEncoder() 方法是用与定义加密和密码验证.
2. configure(HttpSecurity http) 方法是用与配置验证资源策略.
```java
@Override
public void configure(HttpSecurity http) throws Exception {
    //@formatter:off
    http
            .requestMatchers()
        .and()
            .authorizeRequests()
            .antMatchers("/public/**").permitAll()
            .antMatchers("/demo/**").authenticated();
    //@formatter:on
}
```

3. configure(ResourceServerSecurityConfigurer resources) 是用于配置安全策略. 在这里, 必须指定对应的token service来解析token. 一个典型的token service配置如下.
```java
@Bean
@Primary
public DefaultTokenServices tokenServices() {
    DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
    defaultTokenServices.setTokenStore(tokenStore());
    defaultTokenServices.setSupportRefreshToken(true);
    return defaultTokenServices;
}
```

4. JWT 提供了方便的SDK 以让开发者能够直接与自己的应用相集成. 我们需要做的就是指定一个Signing Key.
```java
@Bean
public JwtAccessTokenConverter accessTokenConverter() {
    JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
    converter.setSigningKey(signingKey);
    return converter;
}

@Bean
public TokenStore tokenStore() {
    return new JwtTokenStore(accessTokenConverter());
}
```

```java
@Override
public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
    TokenEnhancerChain enhancerChain = new TokenEnhancerChain();
    enhancerChain.setTokenEnhancers(Collections.singletonList(accessTokenConverter));
    endpoints.tokenStore(tokenStore)
            .accessTokenConverter(accessTokenConverter)
            .tokenEnhancer(enhancerChain)
            .authenticationManager(authenticationManager);
}
```
注意: tokenService 和 authenticationManager 必须使用的是同样的验证方式, 否则Token 将无法通过验证.

5. authenticationManager() 方法是用于定义token解析逻辑, 这个类会在token 被刷新时调用.

#### IV. Optional: 自定义认证逻辑
如果默认的token 验证无法满足你的需求, 这是经常发生的事, 你可以通过如下的代码自定义自己的authenticationProvider: 
```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(jwtAuthenticationProvider());
}
```

jwtAuthenticationProvider 如下: 
```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    DecodedJWT jwt = ((JwtAuthenticationToken) authentication).getToken();
    //I want a token never expired.
    //if (jwt.getExpiresAt().before(Calendar.getInstance().getTime()))
        //throw new NonceExpiredException("Token expires");
    String clientId = jwt.getSubject();
    UserDetails user = userService.loadUserByUsername(clientId);
    if (user == null || user.getPassword() == null)
        throw new NonceExpiredException("Token expires");
    Algorithm algorithm = Algorithm.HMAC256(user.getPassword());
    JWTVerifier verifier = JWT.require(algorithm)
            .withSubject(clientId)
            .build();
    try {
        verifier.verify(jwt.getToken());
    } catch (Exception e) {
        throw new BadCredentialsException("JWT token verify fail", e);
    }
    return new JwtAuthenticationToken(user, jwt, user.getAuthorities());
}
```

#### V. Optional: 自定义验证 Handler
如果方法authenticate() 抛出任何的异常, 我们也许希望在数据库中记录这样的异常. 为了实现这样的需求, 我们只需要指定tokenValidSuccessHandler 和 tokenValidFailureHandler, 在handler里, 我们只需要根据自己的需求重写onAuthenticationSuccess 和 onAuthenticationFailure两个方法.
```java
...
    .and()
        .apply(new MyValidateConfigure<>())
            .tokenValidSuccessHandler(myVerifySuccessHandler())
            .tokenValidFailureHandler(myVerifyFailureHandler())
...
```

```java
public class JwtAuthenticationFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
    }
}
```

#### VI. UserDetailService
UserDetailService 是加载用户详细信息的核心类. 我们必须实现loadUserByUsername()方法来实现权限控制.

#### VII. REST APIs
当以上所有配置都完成之后, 我们就可以开始在我们的应用中使用Token 验证, 并且实现权限控制. 要实现这些, 我们只需要在rest api 定义中加入头注解@PreAuthorize("hasAuthority('ADMIN_USER')").
```java
@RequestMapping(value = "/users", method = RequestMethod.GET)
@PreAuthorize("hasAuthority('ADMIN_USER')") //user with ADMIN_USER role have this access.
public ResponseEntity<List<User>> getUsers() {
    return new ResponseEntity<>(userService.findAllUsers(), HttpStatus.OK);
}
```

### **Demo Time**

#### I. 请求 Token
我们可以使用Postman 客户端或者curl 命令来获取一个拥有Admin 权限的Token.
```sh
curl client-id:client-password@localhost:8080/oauth/token -d grant_type=password -d username=admin.admin -d password=Test!123
```

返回值:
```json
{"access_token":"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsic3ByaW5nLXNlY3VyaXR5LWRlbW8tcmVzb3VyY2UtaWQiXSwidXNlcl9uYW1lIjoiYWRtaW4uYWRtaW4iLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTU0ODQ0NTQxLCJhdXRob3JpdGllcyI6WyJTVEFOREFSRF9VU0VSIiwiQURNSU5fVVNFUiJdLCJqdGkiOiI4MTM3Y2Q4OS0wMWMyLTRkMTgtYjA4YS05MjNkOTcxYjNhYzQiLCJjbGllbnRfaWQiOiJjbGllbnQtaWQifQ.1t_4xVT8xaAtisHaNT_nMRBLKfpiI0SZQ2bbEGxu6mk","token_type":"bearer","expires_in":43199,"scope":"read write","jti":"8137cd89-01c2-4d18-b08a-923d971b3ac4"}
```

#### II. 使用请求的token 验证权限
请求一个需要Admin 权限的API
```sh
curl http://localhost:8080/demo/users -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsic3ByaW5nLXNlY3VyaXR5LWRlbW8tcmVzb3VyY2UtaWQiXSwidXNlcl9uYW1lIjoiYWRtaW4uYWRtaW4iLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTU0ODQ0NTQxLCJhdXRob3JpdGllcyI6WyJTVEFOREFSRF9VU0VSIiwiQURNSU5fVVNFUiJdLCJqdGkiOiI4MTM3Y2Q4OS0wMWMyLTRkMTgtYjA4YS05MjNkOTcxYjNhYzQiLCJjbGllbnRfaWQiOiJjbGllbnQtaWQifQ.1t_4xVT8xaAtisHaNT_nMRBLKfpiI0SZQ2bbEGxu6mk"
```

将会返回:
```json
[{"id":1,"username":"jakob.he","firstName":"Jakob","lastName":"He","roles":[{"id":1,"roleName":"STANDARD_USER","description":"Standard User"}]},{"id":2,"username":"admin.admin","firstName":"Admin","lastName":"Admin","roles":[{"id":1,"roleName":"STANDARD_USER","description":"Standard User"},{"id":2,"roleName":"ADMIN_USER","description":"Admin User"}]}]
```

#### III. 通过JWT验证Token有效性
将我们的token 和signingKey 放入[jwt.io](https://jwt.io), 我们就能得到如下结果.
> ![jwt-verification.jpg]({{ site.url }}/assets/post_images/2019-04-09-spring-security-in-action/pic2.jpg)

我们一起快速回顾一下, 我们介绍了什么是并且为什么要使用Spring Security, 之后我们实现了一个简单的Spring Security 应用, 包含了Token 管理, Token 分发, 还实现了一个需要权限验证的Rest API. 
最后, 希望这篇文章能够帮到你.

##### **Links**
-   [Spring Security](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/)
-   [JWT](https://jwt.io/)
-   [Source Code](https://github.com/jakob-lewei/spring-security-demo)
