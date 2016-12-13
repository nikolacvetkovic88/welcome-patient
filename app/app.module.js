var app = angular.module("welcomeApp", ['ngRoute', 'ngCookies', 'highcharts-ng', 'videosharing-embed', 'ui.calendar', 'base64'])
.run(function ($rootScope, $location, $cookieStore, AuthService, AccountService, ReminderService) {
        // keep user logged in after page refresh
        $rootScope.currentUser = AuthService.getCredentials();
        $rootScope.patient = AccountService.retrievePatient();
        $rootScope.showMainContent = false;

        if($rootScope.currentUser) { // this means that the user is already logged in
            ReminderService.getReminders();
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login') {
                $rootScope.showMainContent = true;
                if(!$rootScope.currentUser) {
                    $location.path('/login');
                }
            } else {
                $rootScope.showMainContent = false;
            }

            if($location.path() == '/' || $location.path() == '/home') {
                $rootScope.isHomePage = true;
            } else {
                $rootScope.isHomePage = false;
            }
        });
    });