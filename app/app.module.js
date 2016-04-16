var app = angular.module("welcomeApp", ['ngRoute', 'ngCookies', 'highcharts-ng', 'videosharing-embed', 'ui.calendar', 'base64'])

.run(function ($rootScope, $location, $cookieStore, ReminderService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        $rootScope.Patient = $cookieStore.get('patient') || {};
        $rootScope.showMainContent = false;

        if($rootScope.globals.currentUser) // this means that the user is already logged in
            ReminderService.registerReminders();


        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login') {
                $rootScope.showMainContent = true;
                if(!$rootScope.globals.currentUser) {
                    $location.path('/login');
                }
            } else {
                $rootScope.showMainContent = false;
            }
        });
    });