---
title: "当我们code review 的时候, 我们究竟在review 什么?(bug 篇)"
date:   2020-09-22
tags:
  - tech
  - engineering practice
---


### Background.

当我们code review 的时候, 我们究竟在review 什么?

为了探索这个问题, 我找到了两个很新鲜的(2020-09-24 15:24 pm) bug 和 new feature 的 pr , 什么样的code review 能无限接近大部分程序开发人员眼中正确的practice.

### Study Case: 一枚来自Spring security 的bug.
> + Issue link: [qavid:gh-8865](https://github.com/spring-projects/spring-security/issues/8865)
> + Merge request link: [pr-8894](https://github.com/spring-projects/spring-security/pull/8894)

> ![Image]({{ site.url }}/images/post_images/2020-09-24-what-are-we-talking-about-when-we-talk-about-code-review-4-bug/pic1.jpg)

1. Bug reporter 在开发过程中遇到了一个特定场景会出现的bug: 当token 是一个不符合规范的token 时, 并且convert() 在没有订阅的情况下, 抛出的异常. 显然convert() 方法在没有订阅的情况下, 是应该要允许非法的token.

    (看, 虽然我尝试用母语描述这个bug, 但是明显在整个描述中有许多异议, 比如: 什么叫"不符合规范的token", "convert() 在没有订阅的情况下" 具体是什么情况, "在有订阅的情况下" 又是怎么样的情况.)
2. Bug reporter 除了描述这个bug 出现的场景之外, **还提供了描述这个场景的UT**. 这里的语义清晰明了, 这个断言**doesNotThrowAnyException()** 一语点破天机.

```java
@Test
public void simpleTest() {
    MockServerHttpRequest.BaseBuilder<?> request = MockServerHttpRequest
            .get("/")
            .header(HttpHeaders.AUTHORIZATION, "bearer !!");
    
    assertThatCode(() -> this.converter.convert(MockServerWebExchange.from(request))).doesNotThrowAnyException();
}
```

3. Bug reporter 提出他能修复这个bug. 在bug reporter 度假回来之后, 提交了PR.
4. 贡献者显然明白bug reporter 描述的场景, 很快通过了review 并且close 了这个issue.
5. 值得注意的是, PR 里包含了上面所提的UT. 而且这个UT 所在的位置紧挨着另一个UT, 描述的场景恰恰就是"有订阅的情况" 的场景.

```java
@Test
public void resolveWhenHeaderWithInvalidCharactersIsPresentThenAuthenticationExceptionIsThrown() {
    ...
}
```

虽然这是一个很简单的bug, 真正的fix就一行代码, 但是他包含了一个有用的UT, 这个UT 它做了好几件有价值的事情
1. **有效沟通**: 
    > 每一个阅读这个issue 的developer 都准确(精确)的领会了bug 出现的场景, 显然这是很难通过三行文字描述清晰的.
2. **把枯燥的code review 转变成了理解业务的过程**
    > code review 的很多时候, 不知不觉的, 就变成了语法, typo, if else 的细节review. 因为每个issue 都很可能有很长的历史, 大段的描述, 完全理解这些business 的过程往往非常消耗时间, 最后就没有人会对核心业务来做review, 反而转向检查语法, for 循环是否用的优雅, 是否有更好的lib 来实现, 比如新的DateUtil~, 当然这些也是需要的, 但是并不是主要的.
    > 阅读UT 就来的准确而且有趣的多.
3. **其它一堆UT 附带的好处**
    > 比如每一次的code change 都会反复检查 etc. (在此不多讨论)

### Let's Review!

所以, 在review 一个bug 的PR 时, 我们需要review 些啥呢? 我认为包括:
 
#### 1. Review core business logic.
核心业务逻辑代码的review 要求reviewer 对bug 的来龙去脉都有所了解, 在完全明白的情况下更为整体的来看PR.
就像study case 里描述的那样, 我认为最好的方法是通过UT 辅助格式化的issue description 来帮助reviewer 了解始末.
更理想的情况下, 我认为如果QA 能直接参与写UT, 将业务场景翻译成UT 最佳!

#### 2. Review implements.
千人千面, 每个人的代码实现都很可能有很大的差别, 在review 的过程中, 提出自己认为更优雅的实现, 或者交流实现的多种可能, 也是很好的相互提升技能的机会.

#### 3. Review coding habit.
通过findbugs, sonarqube 工具来review coding habit, 一些习惯上的建议也能很好的避开隐形bug, 提高项目质量.

#### 4. Review code style.
Review code style by script, 代码风格统一, 在项目中也是必要的.
> ![Image]({{ site.url }}/images/post_images/2020-09-24-what-are-we-talking-about-when-we-talk-about-code-review-4-bug/pic2.jpg)

### The End.
抛开code review 的话题来谈, UT 作为一个看似完美的practice 在许多项目中却是非常缺失的一环, 也是有它的原因的.
1. **开发成本高**
    > 假设我写了一个十行的function, 这个方法涉及到的特殊参数, 边界值, 各种expected exception 和unexpected exception 都考虑上的话, UT 很可能要超过一百行, 换算成项目里最宝贵的时间成本, UT 的权重很可能就被低估了. 大家就默默的对自己说了一句 -> "以后我再补UT" 
2. **维护成本高**
    > 当业务逻辑变化时, 需要及时更新UT(所有相关的UT). 当你改了某个方法的参数类型, 你发现十几个test class 开始泛红, idea 开始编译, 电脑发出CPU 过热的风扇声, 空隙时间里, 你下单了一杯星巴克抬头一看, 二十几个编译错误, QA 又在群里问bug fix 了吗. 好不容易修好了所有编译错误, 一跑测试发现还有十几个测试无法通过, 此时此刻的你很可能就开始批量注释, @Ignore UT了....

拿Case Study 的convert() 方法来说, 他至少被50 个UT Mock 或调用, 而一个小小的改动, 很可能让他们全部failed. 紧接着的一系列维护成本很可能超出想象.

> ![Image]({{ site.url }}/images/post_images/2020-09-24-what-are-we-talking-about-when-we-talk-about-code-review-4-bug/pic3.jpg)

或许这些情况都应该通过代码层面的优化, 合理的拆分UT 的覆盖面等等方法来避免, 不知道大家是否有好的practice 或者心得呢? 

我们下次讨论.

