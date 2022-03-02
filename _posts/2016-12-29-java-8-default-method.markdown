---
title: "[JAVA 8] Default Method"
date:   2016-12-29
tags:
  - java
  - tech
---

#### 什么是Default Method
各位如果点开JAVA源码,就会发现List接口竟然有实现了的方法.
>List.java
```java
default void replaceAll(UnaryOperator<E> operator) {
    Objects.requireNonNull(operator);
    final ListIterator<E> li = this.listIterator();
    while (li.hasNext()) {
        li.set(operator.apply(li.next()));
    }
}
```

它好像拥有所有方法该有的元素,且慢,default是什么鬼??
鬼说:我就是Default Method


#### Default Method初衷
众所周知,ArrayList是一个实现了List的一个常用类,那么我们再翻开它的源码看看这里的replaceAll方法是咋了?为啥在List里多了一个replaceAll方法?
>ArrayList.java
```java
@Override
@SuppressWarnings("unchecked")
public void replaceAll(UnaryOperator<E> operator) {
    Objects.requireNonNull(operator);
    final int expectedModCount = modCount;
    final int size = this.size;
    for (int i=0; modCount == expectedModCount && i < size; i++) {
        elementData[i] = operator.apply((E) elementData[i]);
    }
    if (modCount != expectedModCount) {
        throw new ConcurrentModificationException();
    }
    modCount++;
}
```

Default Method存在的原因是,开发Java API的小伙伴发现了一种通用的方法,能够兼容LinkedList等等等等,包括所有实现了List接口的小伙伴类.
作为你,难道你要把所有实现方法拷贝到每一个接口中去???**不!!**

引入Default Method,Java就允许用户在给同一个接口下的所有实现方法添加一个默认方法,与此同时又不影响所有现有的实现方法,一举两得,何乐而不为

#### Default Method思维模式(我是重点)
因为Default Method的特性,将会多大程度上改变你的编码思维呢?
##### 1. 可选方法
你是否有这样的情况
我implements 了一个interface, 却同时需要implement许多不需要用到的实现如Iterator中的remove().

这时候,我们就可以像下面这样写,就不用再实现一个空的方法
如:
>Iterator.java
```java
default void remove() {
    throw new UnsupportedOperationException("remove");
}
```

##### 2. 行为的多继承
什么!多继承!Java不是不允许多继承的咩咩咩!

没错,现在利用default method,你可以实现.

Java不允许多继承,但是允许用户实现多个接口,这样我们就能实现**类型多继承**.然而由于Java7-的Interface不允许实现方法,我们就无法实现**行为多继承**,但是今天可以了.

>ArrayList.java
```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable{
...
}
```

ArrayList为例,有了行为多继承的思维,我们瞬间就发现了ArrayList不仅仅继承了AbstractList里的那么多行为,还实现了List中的所有default method 定义的行为,包括:replaceAll, sort, spliterator.

有没有很酷!

聪明的小孩回答一定是:*没有*!

是的,如果我实现了两个接口,有相同的default method怎么办!何乐为同学也有同样的疑问.解答如下.

### 解决冲突的规则
简单粗暴,直接上代码

>例1
```java
public class Ambiguous{
    public static void main(String... args) {
        new C().hello();
        new D().hello();
    }
    interface A {
        default void hello() {
            System.out.println("Hello from A");
        }
    }
    interface B {
        default void hello() {
            System.out.println("Hello from B");
        }
    }
    static class C implements B, A {
        @Override
        public void hello() {
            A.super.hello();//消除歧义,编译器要求提供super类型
        }
    }
    static class D implements B {
    }
}
```
```
Hello from A
Hello from B
```

如果看不懂,你就可以默默的转行了.

看懂了,继续往下看.

>例2
```java
public class MostSpecific{
    public static void main(String... args) {
        new C().hello();//Hello from B
        new D().hello();//Hello from A
        new E().hello();//Hello from B
        new F().hello();//Hello from F
        new G().hello();//Hello from F
    }
    static interface A{
        public default void hello() {
            System.out.println("Hello from A");
        }
    }
    static interface B extends A{
        public default void hello() {
            System.out.println("Hello from B");
        }
    }
    static class C implements B, A {}
    static class D implements A{}
    static class E extends D implements B, A{}
    static class F implements B, A {
        public void hello() {
            System.out.println("Hello from F");
        }
    }
    static class G extends F implements B, A{}
}
```

看不懂?请留步.

* new C().hello(); B为A的子类,更为具体,固调用B.hello()
* new D().hello(); D继承与A,并且自己没有hello()实现类,固调用A.hello()
* new E().hello(); E虽然继承与D,但D没有实现类(比较G().hello()),固调用B.hello()
* new F().hello(); 自己有实现类,优先级最高
* new G().hello(); 父类F有实现类,直接调用F.hello()

>例3
```java
public class Diamond{
    public static void main(String...args){
        new D().hello();
    }
    static interface A{
        public default void hello(){
            System.out.println("Hello from A");
        }
    }
    static interface B extends A { }
    static interface C extends A {
    }
    static class D implements B, C {
    }
}
```
```
Hello from A
```


#完
