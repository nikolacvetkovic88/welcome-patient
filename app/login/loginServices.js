app.factory('AuthService', function loginService($rootScope, $http, $cookieStore, $base64) {
        return {
            login: function(credentials) {
                var data = "username=" +  encodeURIComponent(credentials.username) + "&password="
                    + encodeURIComponent(credentials.password) + "&grant_type=password&scope=read%20write&" +
                    "client_secret=mySecretOAuthSecret&client_id=welcomeapp";
                
                return $http.post('http://welcome-test.exodussa.com/oauth/token', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "Authorization": "Basic d2VsY29tZWFwcDpteVNlY3JldE9BdXRoU2VjcmV0"
                    }
                })
            },
            logout: function() {
                //$http.post('http://welcome-test.exodussa.com/logout').then(function() {
                    this.clearCredentials();
                //});
            },
            setCredentials: function(username, password, response) {
                var authdata = $base64.encode(username + ':' + password);

                var expiredAt = new Date();
                expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
                response.expires_at = expiredAt.getTime();


                $rootScope.globals = {
                    currentUser: {
                        username: username,
                        authdata: authdata,
                        token: response
                    }
                };
                $cookieStore.put('globals', $rootScope.globals);
            },
            clearCredentials: function() {
                $rootScope.globals = {};
                $cookieStore.remove('globals');
            },
            getCredentials: function () {
                return $cookieStore.get('globals');
            },
            hasValidToken: function () {
                var credentials = this.getCredentials(),
                    token = credentials ? credentials.token : null;
                return token && token.expires_at && token.expires_at > new Date().getTime();
            }
        };
})

.factory('AccountService', function ($rootScope, $http, $cookieStore) {
    return {
        getPatient: function(token) {
        var url = 'http://welcome-test.exodussa.com/api/account';

        return $http.get(url, {
                headers: {
                    "Authorization": "Bearer" + token
                }
            }) 
        },
        storePatient: function(patient) {
            $rootScope.Patient = patient;
            $cookieStore.put('patient', patient);
        },
        retrievePatient: function() {
            return $cookieStore.get('patient');
        }
    };
});