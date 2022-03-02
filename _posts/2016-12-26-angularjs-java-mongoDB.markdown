---
title: "AngularJs + Java + MongoDB"
date:   2016-12-26
tags:
  - java
  - tech
---

这是一个基本项目框架.基于AngularJs + Java + MongoDB

#####项目树
![]({{ site.url }}/assets/post_images/2016-12-26-angularjs-java-mongoDB/pic1.jpg)

#####原理
java作为MVC的controller层,将数据以webservice方式发送到前端.
AngularJs接收数据展示.
####栗子
#####AngularJS层
>manageStationCtrl.js
```js
'use strict';
angular.module('myApp.manageStation', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/manageStation', {
            templateUrl: 'models/manageStation/manageStation.html',
            controller: 'manageStationCtrl'
        });
    }])
    .controller('manageStationCtrl', ['$scope', 'ManageStationService', function ($scope, ManageStationService) {
        $scope.fromKeyWord = '松柏小学';
        var map = new AMap.Map('mapContainer2', {
            resizeEnable: true,
            zoom: 14,
            center: [118.139839, 24.488006]
        });
        $scope.searchPoint = function () {
            ManageStationService.searchPoint($scope.fromKeyWord);
        }
    }]).factory('ManageStationService', ['$rootScope', '$http', function ($rootScope, $http) {
    return {
        searchPoint: function (keyWord) {
            $http.get('app/rest/busroute/all').success(function (busRoutes) {
                angular.forEach(busRoutes, function (busRoute, routeInd, busArray) {
                    angular.forEach(busRoute.stations, function (station, stationInd, stationArray) {
                        AMap.plugin('AMap.Walking', function () {
                            var walking = new AMap.Walking();
                            walking.search([
                                {keyword: keyWord, city: '厦门市'},
                                {keyword: station.stationName, city: '厦门市'}
                            ], function (status, result) {
                                if ("error" === status) {
                                    console.log(result);
                                }
                                if ('complete' === status) {
                                    var dist = 0;
                                    angular.forEach(result.routes, function (walkRoute, walkInd, walkArray) {
                                        dist += walkRoute.distance;
                                    });
                                    console.log("dist: " + dist);
                                }
                            });
                        });
                    });
                });
            });
        }
    }
}]);
```

#####Java 层
>BusRouteWebService.java
```java
@RequestMapping(value = "/busroute/all",
        method = RequestMethod.GET,
        produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_ATOM_XML_VALUE})
@Timed
public ResponseEntity<List<BusRouteResource>> getAllBusRoute() {
    List<BusRouteDTO> us = busRouteService.findAll();
    List<BusRouteResource> res = us.stream().map(n -> busRouteResourceAssembler.toResource(n)).collect(Collectors.toList());
    return new ResponseEntity<>(res, HttpStatus.OK);
}
```

#####源码!
<https://github.com/leweii/lewei_angul.git>
