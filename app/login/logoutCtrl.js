app.controller('logoutCtrl', function ($scope, $rootScope, $location, $timeout, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.logout = function() {
        AuthService.logout();
        AccountService.removePatient();
        ReminderService.clearReminders();
        $timeout(function() {
        	$location.path("/login");
        }, 50);
    }
});