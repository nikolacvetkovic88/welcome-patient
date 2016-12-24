app.factory('AccountService', function ($rootScope, $http, $cookieStore) {
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
            $rootScope.patient = patient;
            $cookieStore.put('patient', patient);
        },
        removePatient: function() {
            $rootScope.patient = null;
            $cookieStore.remove('patient');
        },
        retrievePatient: function() {
            return $cookieStore.get('patient');
        }
    };
});