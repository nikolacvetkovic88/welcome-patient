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

        .when('/comments', {
            templateUrl : 'app/modules/comments/commentsView.html',
            controller: 'commentsCtrl'
        })

        .when('/medications', {
            templateUrl : 'app/modules/medications/medicationsView.html',
            controller: 'medicationsCtrl'
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