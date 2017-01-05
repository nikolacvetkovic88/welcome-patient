app.controller('loginCtrl', function ($scope, $rootScope, $location, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    AuthService.clearCredentials();

    $scope.login = function () {
        $scope.loading = true;

        AuthService.login({ username: $scope.username, password: $scope.password })
        .success(function(data) {   
            AuthService.setCredentials($scope.username, $scope.password, data);
            if(!AuthService.hasValidToken()) {
            	notify('Login token invalid', 'info');
            	AuthService.clearCredentials();
            	return;
            }

            AccountService.storeToken(data.access_token);
            AccountService.getAccount()
            .success(function(data) {
                AccountService.getPatient(data.cloudRef)
                .success(function(data) {
                    AccountService.storePatient(data);
                    $location.path("/");
                    ReminderService.getReminders();
                })
                .error(function(data, status) {
                    notify(data && data.error_description || data.description || 'Retrieving patient failed', 'error'); 
                    $scope.loading = false;
                });
            })
            .error(function(data, status) {
               notify(data && data.error_description || data.description || 'Retrieving patient account failed', 'error'); 
               $scope.loading = false;
            });
        })
        .error(function(data, status) {
            notify(data && data.error_description || data.description || 'Login request failed', 'error'); 
            $scope.loading = false;
        });
    }
});