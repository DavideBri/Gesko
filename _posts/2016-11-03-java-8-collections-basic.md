---
title: "[JAVA 8] Collections 基本用法"
date:   2016-11-03
tags:
  - java
  - tech
---

#### Java8 Stream的终端操作
+ foreach
+ count
+ **collect**
+ reduce
+ findFirst
+ ...

如果把迭代器(filter, map)看成流水线, 那么终端操作表示将产生出一个最终结果.
今天我们重点介绍 collect 相关的常用用法.

#### 约归和汇总
在数学中,我们常常将问题转移.
例如我们计算`((a + b)2 - a2 - b2)/2`时, 会先化简为`a×b`来计算.
这样的思路我们称之为**约归和汇总**
那么在Java8中, `java.util.stream.Collectors` 很好的提供了寻求约归和汇总这种数学思路的实现方法.
让你得以在Java中灵活运用在高中所学的数学.

#### Collections 意义
从功能的角度.所有的 collect 都是 reducing 工厂方法实现的特殊情况.而 collect 只是增加了代码的可读性.然而代码可读性可是 the top priority issue.

#### 示例
>例1: 收集流
```java
public static void main(String ... args) {
    List<String> inputs = Arrays.asList(args);
    List filteredList = inputs.stream()
        .filter(n-> "".indexOf("abc") > 0).collect(Collectors.toList());
    filteredList.forEach(System.out::print);
}
```
>~~Reducing 实现(复杂且线程危险)~~
```java
public static void main(String ... args) {
List<String> argsList = Arrays.asList(args);
List<String> filteredList = argsList.stream().filter(n -> "".indexOf("abc") > 0)
		.reduce(new ArrayList<String>(), (List<String> list, String s) -> {
			list.add(s);
			return list;
		}, (List<String> list2, String s2) -> {
			list2.add(s2);
			return list2;
		});
}
```
寻找传入参数中包含"abc"字符串的内容,放入filteredList并便利打印它们.

--------

>例2: count
```java
public static Long countDishes(String ... args) {
        return menu.stream().collect(counting());
}
```
>Reducing 实现
```java
public static Long countDishes() {
    return menu.stream().collect(reducing(0L, e -> 1L, Long::sum);
}
```
计算Dishes的数量

--------

>例3: 最值
```java
public static Integer findMaxCaloriesDish() {
        return menu.stream().collect(
                partitioningBy(Dish::isVegetarian,
                        collectingAndThen(maxBy(comparingInt(Dish::getCalories)), Optional::get)));
}
```
>Reducing 实现
```java
public static Integer findMaxCaloriesDish() {
    return menu.stream().collect(reducing(0, Dish::getCalories, (x, y) -> x > y ? x : y));
}
```
筛选出属于素食的，并且所含卡路里最大的Dish

------

>例3: 求和
```java
public static Integer sumAllCalories() {
    return menu.stream().collect(Collectors.summingInt(Dish::getCalories));
}
```

>Reducing 实现
```java
public static Integer sumAllCalories() {
    return menu.stream().collect(reducing(0, Dish::getCalories, (x, y) -> x + y));
}
```
>计算所有食物卡路里的总和.

-----

>例4: 连接字符串
```java
private static String getShortMenuCommaSeparated() {
    return menu.stream().map(Dish::getName).collect(joining(", "));
}
```
>Reducing 实现
```java
public static String getShortMenuCommaSeparated() {
    return menu.stream().collect(reducing("", Dish::getName, (x, y) -> x + ", " + y));
}
```

所以同学们，是不是能体会到Java8的代码看起来像真正的自然语言，而并非一门程序语言了呢？！

_源码: <https://github.com/leweihe/Java8InAction/blob/master/src/main/java/lambdasinaction/chap6/Partitioning.java>_
