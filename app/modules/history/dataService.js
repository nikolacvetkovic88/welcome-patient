app.factory('historyRepository', function($http, $q, helper) {
    var HistoryRepository = {};

    HistoryRepository.getBloodPressureData =  function (patientId, queryParams, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '';
        if(queryParams)
            url += queryParams;

        return helper.getCloudData(url, token);
    }; 
     
    return HistoryRepository;
});