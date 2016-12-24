app.controller('loginCtrl', function ($scope, $rootScope, $location, $timeout, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    AuthService.clearCredentials();

    $scope.login = function () {
        $scope.loading = true;

        AuthService.login({ username: $scope.username, password: $scope.password })
        .success(function(data) {   
            AuthService.setCredentials($scope.username, $scope.password, data);
            AccountService.getPatient(data.access_token)
            .success(function(data) {
                AccountService.storePatient(data);
                $location.path('/');
                ReminderService.getReminders();
            })
            .error(function(data, status) {
               notify(data.error_description || 'Retrieving patient account failed', 'error'); 
            });
        })
        .error(function(data, status) {
            notify(data.error_description || 'Login request failed', 'error'); 
            $scope.loading = false;
        });
    }
});