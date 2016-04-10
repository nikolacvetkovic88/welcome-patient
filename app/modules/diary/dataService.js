app.factory('diaryRepository', function($http) {

var diaryUrl = "app/modules/testData/diary.json";

return {
        getAllDiaryEntries: function() {
            return $http( {
                method: 'GET',
                url: diaryUrl
            })
        }
    };

});