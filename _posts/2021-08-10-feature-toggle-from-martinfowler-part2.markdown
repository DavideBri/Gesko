---
title: "Feature Toggle 的类型 - 翻译自 Martin Fowler"
date:   2021-08-11
tags:
  - tech
  - engineering-practice
---

我们已经看到了 Feature Toggles 提供的基本功能——能够在一个可部署单元中提供替代代码路径，并在运行时在它们之间进行选择。我们可以在各种上下文中，以各种方式使用此工具。 将所有Feature Toggles 集中到同一个储存bucket中可能很诱人，但这是一条危险的道路。 不同类别切换的设计维度是完全不同的，以相同的方式管理它们可能会导致pain in ass。

Feature Toggles 可以分为两个主要维度：Feature Toggles 将持续多长时间以及切换决策需要多大的动态性。 还有其他因素需要考虑 - 例如，谁将管理Feature Toggles - 但我认为生命周期(longevity)和动态性(dynamism)是两个重要因素，可以帮助指导如何管理切换。

让我们通过这两个维度的镜头来考虑各种类别的Feature Toggles，看看它们适合什么地方。

#### Release Toggles
Release Toggles 的存在是为了支持持续交付的。它们允许开发向将还没完全完成的代码提交至主分支（例如 master 或主干），同时仍允许该分支随时部署到Production。

> "Release Toggles 允许不完整和未经测试的代码作为可能永远不会运行的代码发送到生产中。

产品经理还可以使用相同方法的以产品为中心的版本，以防止将不完整的产品功能暴露给最终用户。例如，电子商务网站的产品经理可能不希望让用户看到新的入仓计划功能，而宁愿等到该功能已为所有合作伙伴开启之后才完全放开。又或者，产品经理可能有其他原因不想公开功能，即使它们已经完全实现和测试。例如，功能发布可能与营销活动相协调。使用Release Toggles是实现持续交付原则的最常见方式 -- 持续交付的原则是“将[功能发布]与[代码部署]分离”。

> ![Image]({{ site.url }}/images/post_images/2021-08-09-feature-toggle-from-martinfowler/chart-1.png)

Release Toggle 本质上是过渡性的。它们通常不会停留超过一两周，尽管以产品为中心的Feature Toggles 可能需要保持更长时间。 Release Toggle 的切换决策通常是非常静态的。在特定的版本下，切换决策是相同的，即使需要发布新版本来改变切换决策也是完全可以接受的。

#### Experiment Toggles
Experiment Toggles 常用于执行多变量或 A/B 测试。系统的每个用户都被放置在一个群组中，并且在运行时，切换路由器将根据他们所在的群组向给定用户持续发送一个或另一个代码路径。 通过跟踪不同群组的聚合行为，我们可以比较效果 不同的代码路径。 这种技术通常用于对电子商务系统的购买流程或优惠按钮。

> ![Image]({{ site.url }}/images/post_images/2021-08-09-feature-toggle-from-martinfowler/chart-2.png)

一个 Experiment Toggle 需要以相同的配置保持足够长的时间以产生具有统计意义的结果。这可能意味着数小时或数周生命周期的流量模式。 Experiment Toggle 不适用更长时间的生命周期，因为系统的其他更改可能会使实验结果无效。 就其性质而言，实验切换是高度动态的 - 每个传入请求可能代表不同的用户，因此每一个请求都可能被引导至不同的代码。

#### Ops Toggles
Ops Toggles 常用于控制我们系统行为的操作方面。 我们可能会在无法弄清性能影响时引入，以便Ops 可以随时在生产中快速禁用或降级该功能。

大多数 Ops Toggles 将是相对短暂的 - 一旦对新功能的操作方面获得信心，该标志应该退役。 然而，系统具有少量长寿命“Kill Switches”的情况并不少见，这些"Kill Switches"允许Ops 在系统承受高的负载的时候，优雅地关闭系统中的某些功能。 例如，当我们负载很重时，我们可能希望禁用主页上的“推荐”面板，生成这个panel的成本相对较高。 我咨询了一家在线零售商，他们可能会在高需求产品发布之前，故意禁用网站主要购买流程中的许多非关键功能。 这些长寿的 Ops Toggles 可以被视为手动电路开关。

> ![Image]({{ site.url }}/images/post_images/2021-08-09-feature-toggle-from-martinfowler/chart-3.png)

正如已经提到的，这些标志中的许多只存在一小段时间，但一些关键控制可能几乎无限期地保留给操作员。 由于这些标志的目的是让操作员能够快速对生产问题做出反应，因此他们需要极快地重新配置——如果需要通过发布新版本来切换 Ops Toggle 不太能满足运维人员的需求。

#### Permissioning Toggles

#### Managing different categories of toggles
