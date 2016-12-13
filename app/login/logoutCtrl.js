app.controller('logoutCtrl', function ($scope, $rootScope, $location, $timeout, AuthService, AccountService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.logout = function() {
        AuthService.logout();
        AccountService.removePatient();
        $timeout(function() {
        	$location.path("/login");
        }, 200);
    }
});