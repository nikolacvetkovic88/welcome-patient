app.controller('logoutCtrl', function ($scope, $rootScope, $location, $timeout, AuthService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.logout = function() {
        AuthService.logout();
        $timeout(function() {
        	$location.path("/login");
        }, 200);
        /*.success(function() {
            $location.path('/login');
        })
        .logout(function(data, status) {
            $scope.error = (data || "Request failed") + " :" + status; 
        });*/
    }
});