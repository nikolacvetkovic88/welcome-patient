app.controller('logoutCtrl', function ($scope, $rootScope, $location, $timeout, AuthService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.logout = function() {
        AuthService.logout();
        $timeout(function() {
        	$location.path("/login");
        }, 200);
    }
});