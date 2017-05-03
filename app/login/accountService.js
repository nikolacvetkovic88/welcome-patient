app.factory('AccountService', function ($rootScope, $http, localStorageService, helper) {
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
            localStorageService.set('patient', patient);
        },
        removePatient: function() {
            $rootScope.patient = null;
            localStorageService.remove('patient');
            this.removeToken();
        },
        retrievePatient: function() {
            return localStorageService.get('patient');
        },
        getToken: function() {
            return localStorageService.get('account-token');
        },
        storeToken: function(token) {
            localStorageService.set('account-token', token);
        },
        removeToken: function() {
            localStorageService.remove('account-token');
        }
    };
});