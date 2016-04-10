app.factory('historyRepository', function($http) {

var historyUrl = "app/modules/testData/history.json";

return {
        getAllHistoryEntries: function() {
            return $http( {
                method: 'GET',
                url: historyUrl
            })
        }
    };

});