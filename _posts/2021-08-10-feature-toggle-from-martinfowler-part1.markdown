---
title: "什么是 Feature Toggles - 翻译自 Martin Fowler"
date:   2021-08-10
tags:
  - tech
  - engineering practice
---

Feature Toggles（通常也称为Feature Flags）是一种强大的技术，它允许团队在不更改代码的情况下修改系统行为。 它在很多场景下都适用，它是在实现和管理功能之间切换时很重要的一种实现方式。 Feature Toggles让系统变的复杂。 我们需要使用工具来管理Feature Toggles 以简化它的复杂性。但同时, 在项目中我们还是需要努力减少Feature Toggles的数量。

~

作者介绍：
Pete Hodgson is an independent software delivery consultant based in the San Francisco Bay Area. He specializes in helping startup engineering teams improve their engineering practices and technical architecture.

Pete previously spent six years as a consultant with Thoughtworks, leading technical practices for their West Coast business. He also did several stints as a tech lead at various San Francisco startups.

~

“Feature Toggles”是一组变量，可以帮助团队快速但安全地向用户提供新功能。 在这篇关于Feature Toggles的文章中，我们将从一个简短的故事开始，展示一些Feature Toggles很有用的典型场景。 然后我们将深入研究细节，涵盖有助于团队成功使用Feature Toggles的特定模式和实践。

Feature Toggles也称为Feature Flags、Feature Bits或Feature Flippers。 这些都是同一组技术的同义词。 在本文中，我将交替使用Feature Toggles和Feature Flags。

~

#### 一个Feature Toggles 的故事
想象一下， 您是从事复杂城市规划模拟游戏的多个团队之一。 您的团队负责核心模拟引擎。 您的任务是提高样条网状算法(某个feature)的效率。 您知道这将需要对实施进行相当大的检修，这将需要数周时间。 同时，您团队的其他成员将需要继续在代码库的相关领域进行一些正在进行的工作。

根据过去合并长期存在的分支的痛苦经验，如果可能的话，您希望避免为这项工作分支。 相反，您决定整个团队将继续在”master”上工作，但从事高样条网状算法(某个feature)改进的开发人员将使用Feature Toggles来防止他们的工作影响团队的其他成员或破坏代码库的稳定性。

#### Feature Flag 的诞生
这是第一次的改动前：
```javascript
	function reticulateSplines(){
	    // current implementation lives here
	  }
```
后：
```javascript
	function reticulateSplines(){
	    var useNewAlgorithm = false;
	    // useNewAlgorithm = true; // UNCOMMENT IF YOU ARE WORKING ON THE NEW SR ALGORITHM
	
	    if( useNewAlgorithm ){
	      return enhancedSplineReticulation();
	    }else{
	      return oldFashionedSplineReticulation();
	    }
	  }
	
	  function oldFashionedSplineReticulation(){
	    // current implementation lives here
	  }
	
	  function enhancedSplineReticulation(){
	    // TODO: implement better SR algorithm
	  }
```
两人将当前的算法实现移到了 oldFashionedSplineReticulation 函数中，并将 reticulateSplines 变成了 Toggle Point。 现在，如果有人正在研究新算法，他们可以通过取消注释 useNewAlgorithm = true 行来启用“使用新算法”功能。

#### 让开关成为动态的
几个小时过去了，两人准备好通过一些模拟引擎的集成测试来运行他们的新算法。 他们还希望在同一集成测试运行中使用旧算法。 他们需要能够动态启用或禁用该功能，这意味着是时候从笨拙的注释或取消注释 useNewAlgorithm = true 行的机制继续前进了：
```javascript
	function reticulateSplines(){
	  if( featureIsEnabled("use-new-SR-algorithm") ){
	    return enhancedSplineReticulation();
	  }else{
	    return oldFashionedSplineReticulation();
	  }
	}
```
我们现在引入了一个 featureIsEnabled 函数，一个可用于动态控制哪个代码路径处于活动状态的切换路由器。 实现切换路由器的方法有很多种，从简单的内存存储到具有精美 UI 的高度复杂的分布式系统。 现在我们将从一个非常简单的系统开始：
```javascript
	function createToggleRouter(featureConfig){
	  return {
	    setFeature(featureName,isEnabled){
	      featureConfig[featureName] = isEnabled;
	    },
	    featureIsEnabled(featureName){
	      return featureConfig[featureName];
	    }
	  };
	}
```
我们可以基于一些默认配置创建一个新的Feature Toggle - 可能从配置文件中读取 - 但我们也可以动态地打开或关闭功能。 这允许自动化测试来验证切换功能的两端：
```javascript
	describe( 'spline reticulation', function(){
	  let toggleRouter;
	  let simulationEngine;
	
	  beforeEach(function(){
	    toggleRouter = createToggleRouter();
	    simulationEngine = createSimulationEngine({toggleRouter:toggleRouter});
	  });
	
	  it('works correctly with old algorithm', function(){
	    // Given
	    toggleRouter.setFeature("use-new-SR-algorithm",false);
	
	    // When
	    const result = simulationEngine.doSomethingWhichInvolvesSplineReticulation();
	
	    // Then
	    verifySplineReticulation(result);
	  });
	
	  it('works correctly with new algorithm', function(){
	    // Given
	    toggleRouter.setFeature("use-new-SR-algorithm",true);
	
	    // When
	    const result = simulationEngine.doSomethingWhichInvolvesSplineReticulation();
	
	    // Then
	    verifySplineReticulation(result);
	  });
	});
```

#### 准备发布
随着时间的流逝，团队相信他们的新算法功能完备。为了确认这一点，他们一直在修改更高级别的自动化测试，以便他们在关闭和打开功能的情况下运行系统。该团队还希望进行一些手动探索性测试，以确保一切按预期工作——毕竟，样条网状结构(某个feature)是系统行为的关键部分。

要对尚未被验证为可供一般使用的功能进行手动测试，我们需要能够在生产中为我们的一般用户群关闭该功能，但能够为内部用户打开它。有很多不同的方法来实现这个目标：

- 让Feature Toggles根据切换配置做出决策，并使该配置特定于环境。仅pre production环境中启用新功能。
- 允许在运行时通过某种形式的管理 UI 修改切换配置。使用该管理 UI 在测试环境中启用新功能。
- 教 Toggle Router 如何做出动态的、针对每个请求的切换决策。这些决定将 Toggle Context 考虑在内，例如通过查找特殊的 cookie 或 HTTP 标头。通常 Toggle Context 用作识别发出请求的用户的代理。

（我们稍后将更详细地研究这些方法，所以如果其中一些概念对您来说是新的，请不要担心。）

> ![Image]({{ site.url }}/images/post_images/2021-08-09-feature-toggle-from-martinfowler/overview-diagram.png)

团队决定使用每个请求的Feature Toggles，因为它为他们提供了很大的灵活性。 该团队特别欣赏这将使他们能够在不需要单独的测试环境的情况下测试他们的新算法。 相反，他们可以简单地在他们的生产环境中打开算法，但仅限于内部用户（通过特殊 cookie 检测到）。 团队现在可以为自己打开该 cookie 并验证新功能是否按预期执行。

#### 金丝雀发布
基于迄今为止所做的探索性测试，新的样条网状算法看起来不错。但是，由于它是游戏模拟引擎的关键部分，因此仍然有些不愿意为所有用户启用此功能。团队决定使用他们的 Feature Flag 基础设施来执行金丝雀发布，只为他们总用户群的一小部分启用新功能 - “金丝雀”群组。

该团队通过教授用户群组的概念来增强 Toggle Router 的概念 - 始终体验始终处于开启或关闭状态的功能的用户组。一组 Canary 用户是通过随机抽样 1% 的用户群创建的 - 可能使用用户 ID 的模数。该 Canary 群组将始终启用该功能，而其他 99% 的用户群仍使用旧算法。两个组的关键业务指标（用户参与度、总收入等）都受到监控，以确保新算法不会对用户行为产生负面影响。一旦团队确信新功能没有不良影响，他们就会修改他们的切换配置，为整个用户群启用它。

#### A/B 测试
产品经理了解了这种方法并且非常兴奋。她建议团队使用类似的机制来执行一些 A/B 测试。关于修改crime rate算法是否会影响游戏的可玩性的争论一直长期困扰着他们，现在他们有能力使用数据来解决争论。一个简洁的实现就是，用Feature Toggles。他们将为相当多的用户群体启用该功能，然后研究这些用户与“对照”群体相比的行为。这种方法将使团队有足够的数据支持，来解决有争议的产品争论。

这个简短的场景旨在说明Feature Toggles的基本概念，同时也强调该核心功能可以拥有多少不同的应用程序。现在我们已经看到了这些应用程序的一些示例，让我们更深入地挖掘一下。我们将探索不同类别的Feature Toggles，看看是什么让它们与众不同。我们将介绍如何编写可维护的切换代码，最后分享避免功能切换系统的一些陷阱的实践。 