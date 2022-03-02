---
title: "Spring Security In Action"
date:   2019-04-09
tags:
  - java
  - spring
  - tech
---

### **What is Spring-Security?**
Spring-Security is a highly customizable authentication and access-control framework for java applications. Especially for spring based applications. This is wildly used in Java developing field. 

### **Why we need to use Spring-Security?**
Spring-Security is highly integrated with the most popular framework Spring-Boot. And it support both Authentication and Authorization which is also the most popular way to deal with the security issues between server and client end. Like all Spring based projects, the real power of Spring-Security is found in how easily it can be extended to meet customer requirements.

### **Spring-Security in action**
In this example we will go through a very basic Spring-Security application. There are four important classes to be introduced (HttpSecurity, WebSecurityConfigurer, UserDetailsService, AuthenticationManager). And the final application will cover following features. 
1. username and password verification
2. role control
3. token distribution - using JWT
4. token verification
5. password crypto

> ![spring-security-scope.jpg]({{ site.url }}/assets/post_images/2019-04-09-spring-security-in-action/pic1.png)

Within the process of realization, we may cover some fundamental principle of Spring-Security.

#### I. Include Spring-Security dependencies 
```s
compile "org.springframework.boot:spring-boot-starter-security"
```

#### II. Token distrubtion
In the first place we need to define a way to grant tokens. There are servel ways including "password", "authorization_code", "implicit", "client_credentials". In our example we are using "password" as the grant_type.

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
Most of the time we don't user in memory client id and secret. In the real production, we can config as below to read all clients from database.
```java
configurer.jdbc()
```

Then we need to config token settings including 
1. Token store
2. token converter
3. token manager 
4. enhancer chain. 

In this example we are using JWT to manage our tokens. JWT supplies convience apis that intergrated with Spring-Security closly. There is a converter to convert token and decode token. All you need to do is to set a signing key and then set them in the config(AuthorizationServerEndpointsConfigurer endpoints) function.

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
public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
    TokenEnhancerChain enhancerChain = new TokenEnhancerChain();
    enhancerChain.setTokenEnhancers(Collections.singletonList(accessTokenConverter));
    endpoints.tokenStore(tokenStore)
            .accessTokenConverter(accessTokenConverter)
            .tokenEnhancer(enhancerChain)
            .authenticationManager(authenticationManager);
}
```
Remember the tokenService and authenticationManager must be the same one in token verication, so that the token can be decode properly.

#### III. Token verication
Now you are able to realize you own security policy. A popular way is to extend WebSecurityConfigurerAdapter and rewrite security control functions base on customer's requirement. Three important functions are as below.
1. The passwordEncoder() function define the way to encode and compare the passwords.
2. The configure(HttpSecurity http) function is to set resource strategy.
```java
@Override
public void configure(HttpSecurity http) throws Exception {
    //@formatter:off
    http
            .requestMatchers()
        .and()
            .authorizeRequests()
            .antMatchers("/public/**").permitAll() //no authorization required here
            .antMatchers("/demo/**").authenticated(); //need authorization
    //@formatter:on
}
```

3. The configure(ResourceServerSecurityConfigurer resources) function is to defin security strategy. 
In this config() function we need to assign a token service to explain tokens. A typical token service is defining as below. 
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

4. The authenticationManager() function is defining the token verify logic. This class will be use to check the user authentication when a token is refreshed.

#### IV. Optional: custome token authority verification logic
If the default token manager does not meet your requirement, which is happening all the time, you could assign you own authenticationProvider by following code.
```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(jwtAuthenticationProvider());
}
```

And the provider can be like this
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
#### V. Optional: custome verify chain
If the authenticate() function throws any exception, we may to handle it or just record it in the database. To implement it we can just set tokenValidSuccessHandler and tokenValidFailureHandler. In the handler, you can rewrite onAuthenticationSuccess and onAuthenticationFailure with your own logic.
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
UserDetailService is the core interface which loads user-specific data. We mast realize loadUserByUsername() function to locate user and user's role.

#### VII. Rest APIs
Once all authoritioin configure has been finished, you can enjoy your developing. To control your role and access you can simply add @PreAuthorize("hasAuthority('ADMIN_USER')") in your rest api declaration.
```java
@RequestMapping(value = "/users", method = RequestMethod.GET)
@PreAuthorize("hasAuthority('ADMIN_USER')") //user with ADMIN_USER role have this access.
public ResponseEntity<List<User>> getUsers() {
    return new ResponseEntity<>(userService.findAllUsers(), HttpStatus.OK);
}
```

### **Demo**

#### I. Apply for a token
Client end can either use postman or curl to get a token.

```sh
curl client-id:client-password@localhost:8080/oauth/token -d grant_type=password -d username=admin.admin -d password=Test!123
```

You will get:
```json
{"access_token":"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsic3ByaW5nLXNlY3VyaXR5LWRlbW8tcmVzb3VyY2UtaWQiXSwidXNlcl9uYW1lIjoiYWRtaW4uYWRtaW4iLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTU0ODQ0NTQxLCJhdXRob3JpdGllcyI6WyJTVEFOREFSRF9VU0VSIiwiQURNSU5fVVNFUiJdLCJqdGkiOiI4MTM3Y2Q4OS0wMWMyLTRkMTgtYjA4YS05MjNkOTcxYjNhYzQiLCJjbGllbnRfaWQiOiJjbGllbnQtaWQifQ.1t_4xVT8xaAtisHaNT_nMRBLKfpiI0SZQ2bbEGxu6mk","token_type":"bearer","expires_in":43199,"scope":"read write","jti":"8137cd89-01c2-4d18-b08a-923d971b3ac4"}
```

#### II. Use the token in role control
Then use the token above to post a request which need authorition.
```sh
curl http://localhost:8080/demo/users -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsic3ByaW5nLXNlY3VyaXR5LWRlbW8tcmVzb3VyY2UtaWQiXSwidXNlcl9uYW1lIjoiYWRtaW4uYWRtaW4iLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTU0ODQ0NTQxLCJhdXRob3JpdGllcyI6WyJTVEFOREFSRF9VU0VSIiwiQURNSU5fVVNFUiJdLCJqdGkiOiI4MTM3Y2Q4OS0wMWMyLTRkMTgtYjA4YS05MjNkOTcxYjNhYzQiLCJjbGllbnRfaWQiOiJjbGllbnQtaWQifQ.1t_4xVT8xaAtisHaNT_nMRBLKfpiI0SZQ2bbEGxu6mk"
```
It will return:
```json
[{"id":1,"username":"jakob.he","firstName":"Jakob","lastName":"He","roles":[{"id":1,"roleName":"STANDARD_USER","description":"Standard User"}]},{"id":2,"username":"admin.admin","firstName":"Admin","lastName":"Admin","roles":[{"id":1,"roleName":"STANDARD_USER","description":"Standard User"},{"id":2,"roleName":"ADMIN_USER","description":"Admin User"}]}]
```

#### III. Verify the token by JWT
Put your token and signing key in [jwt.io](https://jwt.io), you will get following result.

> ![jwt-verification.jpg]({{ site.url }}/assets/post_images/2019-04-09-spring-security-in-action/pic2.jpg)


Let’s quickly go over, we have introduced what is Spring-Security, why we need to use it, and after all we have also realize a complete Spring-Security application including token management, token distribution, and rest APIs that requiring web authorization. 
I hope it helps.

##### **Links**
-   [Spring Security](https://spring.io/projects/spring-security)
-   [JWT](https://jwt.io/)
-   [Source Code](https://github.com/jakob-lewei/spring-security-demo)
