---
title: "[JAVA 8] Collections 进阶用法"
date:   2016-11-04
tags:
  - java
  - tech
---

Collections 除了基本统计用法,还有提供了类似SQL分组数据的用法.通过传递分组参数
写一句sql, 
```sql
select DISH_TYPE from DISH where 1 = 1 group by DISH_TYPE;
```
有时候,很多时候很多场景,我们都要对所属数据进行这样的grouping.特别现在前后端交互,json盛行之时.
顾,java8中提供了分组的接口,可以将数据简单的封装成一个Map

#####示例
>例1: 分组(Grouping)
```java
private static Map<CaloricLevel, List<Dish>> groupDishesByCaloricLevel() {
    return menu.stream().collect(
            groupingBy(dish -> {
                if (dish.getCalories() <= 400) return CaloricLevel.DIET;
                else if (dish.getCalories() <= 700) return CaloricLevel.NORMAL;
                else return CaloricLevel.FAT;
            } ));
}
```
运行结果:
```高阶
{FISH=[prawns, salmon], MEAT=[pork, beef, chicken], OTHER=[french fries, rice, season fruit, pizza]}
```

----

>例2: 多级Grouping
```java
private static Map<Dish.Type, Map<CaloricLevel, List<Dish>>> groupDishedByTypeAndCaloricLevel() {
    return menu.stream().collect(
            groupingBy(Dish::getType,
                    groupingBy((Dish dish) -> {
                        if (dish.getCalories() <= 400) return CaloricLevel.DIET;
                        else if (dish.getCalories() <= 700) return CaloricLevel.NORMAL;
                        else return CaloricLevel.FAT;
                    } )
            )
    );
}
```
运行结果:
```
{FISH={NORMAL=[salmon], DIET=[prawns]}, MEAT={NORMAL=[beef], DIET=[chicken], FAT=[pork]}, OTHER={NORMAL=[french fries, pizza], DIET=[rice, season fruit]}}
```

#####反例!
斟酌何时使用何种实现方式,要求你能理解领悟每种方式的优缺点和特点.

今天在一次排除重复用户名不同对象时候滥用了Collectors的Grouping方法.被无情的指出后记录于此.
```java
public Set<UserDTO> findAllUserByRoles(final String... roles) {
    final String isimAppName = environmentService.getIsimApplicationName();
    Set<UserDTO> users = new HashSet<>();
    Stream.of(roles).forEach(roleName -> {
        users.addAll(mapper.mapToDTOs(mapper.mapExtranetDatasToCotoolUsers(extranetRepoProxy.findAllUsersByRole(isimAppName, roleName))));
    });
    Map<String, List<UserDTO>> usersByUsername = users.stream().collect(Collectors.groupingBy(UserDTO::getUsername));
    return usersByUsername.values().stream().map(n -> n.stream().findFirst().get()).collect(Collectors.toSet());
}
```
~~思路:根据username分组,再getFirst,如此处理之后便剩下username不重复的所有用户.~~
思路的确能达到效果,但是画蛇添足.

改正后:
```java
public Set<UserDTO> findAllUserByRoles(final String... roles) {
    final String isimAppName = environmentService.getIsimApplicationName();
    List<UserDTO> users = new ArrayList<>();
    Stream.of(roles).forEach(roleName -> {
        users.addAll(mapper.mapToDTOs(extranetRepoProxy.findAllUsersByRole(isimAppName, roleName)));
    });
    return users.stream().distinct().collect(Collectors.toSet());
}
```
并重写UserDTO中的 equals 和 hashCode 方法

For removing duplicate elements from a stream you can use “distinct()”, if the object in your stream have implemented the equals and hashcode method.
