app.controller('historyCtrl', function($scope, $rootScope, $q, historyRepository, helper, AccountService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
    $scope.token = AccountService.getToken();
  
    $scope.buildChart = function(type, unit, data) {
        $scope.myChartObject = {
            type: "LineChart",
            options: {
                    "vAxis": {
                        "title": unit ? type + "  (" + unit + ")" : type
                    },
                    "hAxis": {
                        "title": "Date/DateTime"
                    }
            },
            data: data
        };
    }

    $scope.getDeviceData = function(type) {  
        $scope.type = type;

        $scope.loading = true;
        return historyRepository.getData($scope.patientId, $scope.getQueryParams(), $scope.token, type)
        .then(function(response) {
          return historyRepository.decodeData(response.data, $scope.patientId, type); 
        })
        .then(function(refs) {
          return $scope.getUriPromises(refs); 
        })
        .then(function(data) {
          return $scope.getData(data, type);
        })
        .then(function(results) {
            if(results && results.length) {
                $scope.buildChart(type, results[0] && results[0].unit, $scope.parseData($scope.sortData(results, true), null, type, null, "single-device"));
            } else {
                helper.notify('No data available for this patient.', 'info');
            }

            $scope.loading = false;
        });
    }  

    $scope.getMultipleDeviceData = function(type, type1, type2) {
        $scope.type = type;

        $scope.loading = true;
        return historyRepository.getData($scope.patientId, $scope.getQueryParams(), $scope.token, type1)
        .then(function(response) {
          return historyRepository.decodeData(response.data, $scope.patientId, type1); 
        })
        .then(function(refs) {
          return $scope.getUriPromises(refs); 
        })
        .then(function(data) {
          return $scope.getData(data, type1);
        })
        .then(function(results) {
            return historyRepository.getData($scope.patientId, $scope.getQueryParams(), $scope.token, type2)
            .then(function(response) {
              return historyRepository.decodeData(response.data, $scope.patientId, type2); 
            })
            .then(function(refs) {
              return $scope.getUriPromises(refs); 
            })
            .then(function(data) {
              return $scope.getData(data, type2);
            })
            .then(function(results2) {
            if(results && results.length || results2 && results2.length) {
                $scope.buildChart(type, results[0] && results[0].unit || results2[0] && results2[0].unit, $scope.parseData($scope.sortData(results, true), results2, type1, type2, "multiple-devices"));
            } else {
                helper.notify('No data available for this patient.', 'info');
            }

            $scope.loading = false;
            });
        });
    }

    $scope.getUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
          promises.push(historyRepository.getDatumByRef(ref, $scope.token));
        });

        return $q.all(promises);
    }

    $scope.getData = function(data, type) {
        var promises = [];
        angular.forEach(data, function(datum) {
          promises.push(historyRepository.decodeDatum(datum.data, type));
        });

        return $q.all(promises);
    }

    $scope.parseData = function(data, data2, type1, type2, mode) {
        var parsedData = [];

        switch (mode) {
            case "single-device":
                angular.forEach(data, function(datum) {
                    var parsedObject = {
                        "c": [
                            {
                                "v": helper.formatDateTimeForUser(datum.date)
                            },  
                            {
                                "v": parseFloat(datum.value)
                            }
                        ]
                    };
                
                    parsedData.push(parsedObject);
                });

                return {
                    "cols": [{
                        id: "date/datetime",
                        label: "date/datetime",
                        type: "string"
                    }, 
                    {
                        id: type1,
                        label: type1,
                        type: "number"
                    }],
                    "rows": parsedData
                };

            case "multiple-devices":
                if(data.length && data2.length) {
                    angular.forEach(data, function(datum, i) {
                        var parsedObject = {
                            "c": [
                                {
                                    "v": helper.formatDateTimeForUser(datum.date)
                                },  
                                {
                                    "v": parseFloat(datum.value)
                                },
                                {
                                    "v": parseFloat(data2[i] && data2[i].value)
                                }
                            ]
                        };
                    
                        parsedData.push(parsedObject);
                    });
                } else if (data.length && !data2.length) {
                    angular.forEach(data, function(datum, i) {
                        var parsedObject = {
                            "c": [
                                {
                                    "v": helper.formatDateTimeForUser(datum.date)
                                },  
                                {
                                    "v": parseFloat(datum.value)
                                }
                            ]
                        };
                    
                        parsedData.push(parsedObject);
                    });
                } else if(!data.length && data2.length) {
                    angular.forEach(data2, function(datum, i) {
                        var parsedObject = {
                            "c": [
                                {
                                    "v": helper.formatDateTimeForUser(datum.date)
                                },  
                                {
                                    "v": parseFloat(datum.value)
                                }
                            ]
                        };
                    
                        parsedData.push(parsedObject);
                    });
                } else 
                    return;

                return {
                    "cols": [{
                        id: "date/datetime",
                        label: "date/datetime",
                        type: "string"
                    }, 
                    {
                        id: type1,
                        label: type1,
                        type: "number"
                    },
                    {
                        id: type2,
                        label: type2,
                        type: "number" 
                    }],
                    "rows": parsedData
                };

            default:
                break;
        }
    }

    $scope.getQueryParams = function() {
        return "?q=Observation.applies,afterEq," + helper.formatDateForServer(moment().subtract(30,'days')) + ",asc";
    }

    $scope.sortData = function(data, asc) {
        if (asc)
            return data.sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
        else
            return data.sort(function (a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }

});