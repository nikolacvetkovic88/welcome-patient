app.factory('AccountService', function ($rootScope, $http, $cookieStore) {
    return {
        getAccount: function() {
            var url = 'http://welcome-test.exodussa.com/api/account';
            var token = this.getToken();

            return $http.get(url, {
                headers: {
                    "Authorization": "Bearer" + token
                }
            });
        },
        getPatient: function(cloudRef) {
            var url = 'http://welcome-test.exodussa.com/api/patients/search/' + cloudRef;
            var token = this.getToken();
            
            return $http.get(url, {
                headers: {
                    "Authorization": "Bearer" + token
                }
            });
        },
        storePatient: function(patient) {
            $rootScope.patient = patient;
            $cookieStore.put('patient', patient);
        },
        removePatient: function() {
            $rootScope.patient = null;
            $cookieStore.remove('patient');
            this.removeToken();
        },
        retrievePatient: function() {
            return $cookieStore.get('patient');
        },
        getToken: function() {
            return $cookieStore.get('account-token');
        },
        storeToken: function(token) {
            $cookieStore.put('account-token', token);
        },
        removeToken: function() {
            $cookieStore.remove('account-token');
        }
    };
});