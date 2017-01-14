app.controller('loginCtrl', function ($scope, $rootScope, $location, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    AuthService.clearCredentials();

    $scope.login = function () {
        $scope.loading = true;

        AuthService.login({ username: $scope.username, password: $scope.password })
        .success(function(data) {   
            AuthService.setCredentials($scope.username, $scope.password, data);
            AccountService.storeToken(data.access_token);
            AccountService.getAccount()
            .success(function(data) {
                AccountService.getPatient(data.cloudRef)
                .success(function(data) {
                    AccountService.storePatient(data);
                    ReminderService.getReminders();
                    $location.path("/");
                })
                .error(function(data, status) {
                    notify(data && data.error_description || data.description || 'Retrieving patient failed', 'danger'); 
                    $scope.loading = false;
                });
            })
            .error(function(data, status) {
               notify(data && data.error_description || data.description || 'Retrieving patient account failed', 'danger'); 
               $scope.loading = false;
            });
        })
        .error(function(data, status) {
            notify(data && data.error_description || data.description || 'Login request failed', 'danger'); 
            $scope.loading = false;
        });
    }
});