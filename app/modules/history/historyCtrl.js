app.controller('historyCtrl', function($scope, $timeout, historyRepository) {
    $scope.$emit('body:class:add', "transparent");
    $scope.selected = null;

    $scope.getHistoryData = function() {
        $scope.loading = true;
        
        historyRepository.getAllHistoryEntries()
        .success(function(data) {
            $scope.historyData = data.history;
            $scope.loading = false;

            $scope.setSelected($scope.historyData[0].id);
            initCharts($scope); // init here or just push data here?
         })
        .error(function() {
            $scope.loading = false;
            notify("Failed loading history data", "error");
        });
    }

    $scope.setSelected = function(id) {
        $scope.selected = id;
    }

    $scope.getSpecificData = function(id) {
    	var found = false,
        specificData = {};

        angular.forEach($scope.historyData, function (data, index) {
            if(!found) {
                if(data.id == id) {
                    specificData = data;
                    found = true;
                }
            }
        });

        return specificData;
   }
    
    $scope.parseDateTime = function(value) {
        return formatDateTimeForUser(value);
    }

    $scope.getGraphLabels = function(id) {
        var graphLabels = [],
            labels1 = [],
            labels2 = [];

        angular.forEach($scope.getSpecificData(id).values, function (value, index) {
            if(id == 3) {
                labels1.push($scope.parseDateTime(value.morningdatetime));
                labels2.push($scope.parseDateTime(value.afternoondatetime));
            } else {
                labels1.push($scope.parseDateTime(value.datetime));
            }
        });
        graphLabels.push(labels1);
        graphLabels.push(labels2);

        return graphLabels;
    }

    $scope.getGraphData = function(id) {
        var graphData = [],
            dataSet1 = [],
            dataSet2 = [];

        angular.forEach($scope.getSpecificData(id).values, function (data, index) {
            switch(id) {
                case 1:
                    dataSet1.push(parseInt(data.systolic));
                    dataSet2.push(parseInt(data.diastolic));
                    break;
                case 2:
                    dataSet1.push(parseFloat(data.weight));
                    break;
                case 3:
                    dataSet1.push(parseInt(data.morning));
                    dataSet2.push(parseInt(data.afternoon));
                    break;
                case 4:
                    dataSet1.push(parseFloat(data.temperature));
                    break;
                default:
                    break;
            }
        });
        graphData.push(dataSet1);
        graphData.push(dataSet2);

        return graphData;
    }

    $scope.getHistoryData();
});