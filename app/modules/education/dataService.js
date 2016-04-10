app.factory('educationRepository', function($http) {

var educationUrl = "app/modules/testData/education.json";

return {
        getAllEducationTopics: function() {
            return $http( {
                method: 'GET',
                url: educationUrl
            })
        }
    };

});