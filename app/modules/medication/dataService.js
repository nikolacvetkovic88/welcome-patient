app.factory('medicationRepository', function($http) {

var medicationsUrl = "app/modules/testData/medications.json";

return {
        getAllMedications: function() {
            return $http( {
                method: 'GET',
                url: medicationsUrl
            })
        }
    };

});