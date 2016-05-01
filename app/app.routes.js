app.config(function($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'app/login/login.html',
            controller: 'loginCtrl',
            hideMenus: true
        })

        .when('/', {
            templateUrl : 'app/home/home.html',
            controller: 'homeCtrl'
        })

        .when('/home', {
            templateUrl : 'app/home/home.html',
            controller: 'homeCtrl'
        })

        .when('/diary', {
            templateUrl : 'app/modules/diary/diaryView.html',
            controller: 'diaryCtrl'
        })

        .when('/comment', {
            templateUrl : 'app/modules/comment/commentView.html',
            controller: 'commentCtrl'
        })

        .when('/medication', {
            templateUrl : 'app/modules/medication/medicationView.html',
            controller: 'medicationCtrl'
        })

        .when('/questionnaires', {
            templateUrl : 'app/modules/questionnaires/questionnairesView.html',
            controller: 'questionnairesCtrl'
        })

        .when('/education', {
            templateUrl : 'app/modules/education/educationView.html',
            controller: 'educationCtrl'
        })

        .when('/history', {
            templateUrl : 'app/modules/history/historyView.html',
            controller: 'historyCtrl'
        })

        .otherwise({ redirectTo: '/login' });
});