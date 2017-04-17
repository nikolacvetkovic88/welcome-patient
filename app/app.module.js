var app = angular.module("welcomeApp", ['ngRoute', 'ngCookies', 'LocalStorageModule', /*'highcharts-ng',*/ 'ui.calendar', 'base64'])
.run(function ($rootScope, $location, $cookieStore, AuthService, AccountService, ReminderService) {
        // keep user logged in after page refresh
        $rootScope.currentUser = AuthService.getCredentials();
        $rootScope.patient = AccountService.retrievePatient();

        if($rootScope.currentUser) { // this means that the user is already logged in
            ReminderService.getReminders();
        }

        $rootScope.$on("$locationChangeStart", function (event, next, current) {
            if ($location.path() !== "/login") {
                if(!$rootScope.currentUser) { // redirect to login page if not logged in
                    $location.path("/login");
                } else if(!AuthService.hasValidToken()) { // logout if the token has expired
                    AuthService.logout();
                } else {                   
                    $rootScope.showMainContent = true;
                }
            } else {
                $rootScope.showMainContent = false;
            }

            $rootScope.isHomePage = $location.path() == "/" || $location.path() == "/home" ? true : false;
        });
    });