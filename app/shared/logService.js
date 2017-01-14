app.factory('logRepository', function() {
    var self = this;
});
/*app.factory('LogService', function loginService($http) {
    return {
        log: function(data, message) {
            var url = 'assets/logs/questionnaires.json',
                dateTime = formatDateTimeForUser(moment());

        var dataToLog = {
            date: dateTime,
            data: data,
            message: message
        };

        return $http({
                method: 'POST',
                data: angular.toJson(dataToLog),
                url: url
            });
        }
    }
});*/
