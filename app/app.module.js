var app = angular.module("welcomeApp", ['ngRoute', 'ngCookies', 'highcharts-ng', 'videosharing-embed', 'ui.calendar', 'base64'])
.run(function ($rootScope, $location, $cookieStore, ReminderService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        $rootScope.Patient = $cookieStore.get('patient') || {};
        $rootScope.reminderInterval = $cookieStore.get('reminderInterval');
        $rootScope.showMainContent = false;

        if(!$rootScope.reminderInterval)
            $rootScope.reminderInterval = 3600000;
        if($rootScope.globals && $rootScope.globals.currentUser) { // this means that the user is already logged in
            ReminderService.getReminders($rootScope.reminderInterval);
        }


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

            if($location.path() == '/' || $location.path() == '/home') {
                $rootScope.isHomePage = true;
            } else {
                $rootScope.isHomePage = false;
            }
        });
    });