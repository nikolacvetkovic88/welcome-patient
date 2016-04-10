app.factory('questionnairesRepository', function($http) {
var questionnairesUrl = "app/modules/testData/questionnaires.json";

return {
        getAllQuestionnaires: function() {
            return $http({
                method: 'GET',
                url: questionnairesUrl
            })
        }
    };

});