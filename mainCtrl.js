var vm = {};
app.controller('mainCtrl', function ($scope, $rootScope, $location) {
    vm =$scope;

    $scope.$emit('body:class:add', "transparent");
    $scope.$on('$routeChangeStart', function(next, current) { 
        if(current.originalPath == "/login") {
            $scope.showMainContent = false;
            $scope.showWeather = false;
        } else {
            $scope.showMainContent = true;
            $scope.showWeather = true;
        }
    });
});
