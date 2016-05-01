app.factory('commentRepository', function($http) {

var commentUrl = "app/modules/testData/comments.json";

return {
        getComments: function() {
            return $http( {
                method: 'GET',
                url: commentUrl
            })
        }
    };

});