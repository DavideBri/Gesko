---
title: "[Mapstruct] 基本用法"
date:   2016-11-08
tags:
  - java
  - tech
---

渔人,你还在手动些各种对象转换的代码吗?

java中,有hacker已经提供了一个开源项目,实现用注释的方式自动转换任意对象.
<http://www.mapstruct.org>

下面这个例子包含:
1. 不同文件名之间的转换.
2. 嵌入自定义java代码
3. 默认情况:同变量名,同变量类型自动get set
4. 忽略某些不需要map的变量
>##例1: 典例
```java
@Mappings({
    @Mapping(target = "foreignId", source = "nodeId"),
    @Mapping(target = "progress", expression = "java( hierarchyChange.isFinished() ? 100 : 0 )"),
    @Mapping(target = "secret", ignore=true),
    @Mapping(target = "status", expression = "java( hierarchyChange.isFinished() ? ProgressDTO.STATUS_SUCCESS : ProgressDTO.STATUS_IN_PROGRESS )"),
    @Mapping(target = "action", expression = "java( hierarchyChange.isFinished() ? null : hierarchyChange.getAction().toString() )")
})
ProgressDTO hierarchyChangeToProgressDTO(HierarchyChange hierarchyChange);
```
编译后代码:
```java
@Override
public ProgressDTO hierarchyChangeToProgressDTO(HierarchyChange hierarchyChange) {
    if ( hierarchyChange == null ) {
        return null;
    }
    ProgressDTO progressDTO = new ProgressDTO();
    progressDTO.setProcessType( hierarchyChange.getProcessType() );
    progressDTO.setForeignId( hierarchyChange.getNodeId() );
    progressDTO.setProgress( hierarchyChange.isFinished() ? 100 : 0 );
    progressDTO.setAction( hierarchyChange.isFinished() ? null : hierarchyChange.getAction().toString() );
    progressDTO.setStatus( hierarchyChange.isFinished() ? ProgressDTO.STATUS_SUCCESS : ProgressDTO.STATUS_IN_PROGRESS );
    return progressDTO;
}
```

----

>##例2: 数组数列转换
```java
public abstract Set<UserDTO.ProfileConnectionDTO> fromUserToProfilesToProfileConnectionDTOs(Set<UserToProfile> userToProfile);
```
编译后代码:
```java
@Override
public Set<ProfileConnectionDTO> fromUserToProfilesToProfileConnectionDTOs(Set<UserToProfile> userToProfile) {
    if ( userToProfile == null ) {
        return null;
    }
    Set<ProfileConnectionDTO> set = new HashSet<ProfileConnectionDTO>();
    for ( UserToProfile userToProfile_ : userToProfile ) {
        try {
            set.add( fromUserToProfileToProfileConnectionDTO( userToProfile_ ) );
        }
        catch ( ItemNotFoundException e ) {
            throw new RuntimeException( e );
        }
    }
    return set;
}
```

注意:数组数列转换时,调用的是单个对象转换方法,此法方必须定义单个对象转换的方法: fromUserToProfileToProfileConnectionDTO
