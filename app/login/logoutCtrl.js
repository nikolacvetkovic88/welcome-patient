app.controller('logoutCtrl', function ($scope, AuthService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.logout = function() {
        AuthService.logout();
    }
});