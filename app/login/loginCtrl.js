app.controller('loginCtrl', function ($scope, $rootScope, $location, $timeout, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    AuthService.clearCredentials();

    $scope.login = function () {
        $scope.dataLoading = true;

        AuthService.login({ username: $scope.username, password: $scope.password })
        .success(function(data) {   
            AuthService.setCredentials($scope.username, $scope.password, data);
            AccountService.getPatient(data.access_token)
            .success(function(data) {
                AccountService.storePatient(data);
                $location.path('/');
                ReminderService.getReminders($rootScope.reminderInterval || 3600000);
            })
            .error(function(data, status) {
                $scope.error = (data || "Retrieving patient account failed") + " :" + status; 
            });
        })
        .error(function(data, status) {
            $scope.error = (data || "Login request failed") + " :" + status; 
            $scope.dataLoading = false;
        });
    }
});
