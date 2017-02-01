app.factory('AccountService', function ($rootScope, $http, $cookieStore, helper) {
    return {
        getAccount: function() {
            var url = helper.hubUrl + '/api/account';
            var token = this.getToken();

            return helper.getHubData(url, token);
        },
        getPatient: function(cloudRef) {
            var url = helper.hubUrl + '/api/patients/search/' + cloudRef;
            var token = this.getToken();
            
            return helper.getHubData(url, token);
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