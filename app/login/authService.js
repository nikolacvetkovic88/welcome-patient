app.factory('AuthService', function loginService($rootScope, $http, $location, $base64, localStorageService, helper, AccountService, ReminderService) {
    return {
        login: function(credentials) {
            var data = "username=" +  encodeURIComponent(credentials.username) + "&password="
                + encodeURIComponent(credentials.password) + "&grant_type=password&scope=read%20write&" +
                "client_secret=mySecretOAuthSecret&client_id=welcomeapp";
            
            return $http.post(helper.hubUrl + '/oauth/token', data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": "Basic d2VsY29tZWFwcDpteVNlY3JldE9BdXRoU2VjcmV0"
                }
            })
        },
        logout: function() {
            var self = this;
            $http.post(helper.hubUrl + '/api/logout').then(function() {
                self.clearCredentials();
                $location.path("/login");
                ReminderService.clearReminders();
                AccountService.removePatient();
            });
        },
        setCredentials: function(username, password, response) {
            var authdata = $base64.encode(username + ':' + password);

            var expiredAt = new Date();
            expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
            response.expires_at = expiredAt.getTime();

            $rootScope.currentUser = {
                username: username,
                authdata: authdata,
                token: response
            };
            localStorageService.set('currentUser', $rootScope.currentUser);
        },
        clearCredentials: function() {
            $rootScope.currentUser = null;
            localStorageService.remove("currentUser");
        },
        getCredentials: function () {
            return localStorageService.get('currentUser');
        },
        hasValidToken: function () {
            var credentials = this.getCredentials(),
                token = credentials ? credentials.token : null;

            return token && token.expires_at && token.expires_at > new Date().getTime();
        }
    };
});