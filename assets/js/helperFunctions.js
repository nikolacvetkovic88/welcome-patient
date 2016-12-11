var chartOptions = {
    tooltip: {
        style: {
            padding: 10,
            fontWeight: 'bold'
        }
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        series: {
            events: {
                legendItemClick: function (event) {
                    return false;
                }
            }
        }
    }
}

function formatDateForUser(date) {
    return moment(date).format("ll");
}

function formatDateTimeForUser(dateTime) {
    return moment(dateTime).format("ll HH:mm");
}

function notify(message, mode) {
    $.notify(message, mode);
    $.notify(message, { position: "top center", className: mode })
}

function initCharts($scope) {
    $scope.BPchartOptions = {
        chart: {
            type: 'line'
        }
    };
    $.extend($scope.BPchartOptions, chartOptions);
    $scope.BPvisible = false;
    $scope.BPtoggle = function() {
        $scope.BPvisible = !$scope.BPvisible;
    }
    $scope.swapBPChartType = function () {
        if ($scope.BPchartConfig.options.chart.type === 'line') {
            $scope.BPchartConfig.options.chart.type = 'bar';
        } else {
            $scope.BPchartConfig.options.chart.type = 'line';
            $scope.BPchartConfig.options.chart.zoomType = 'x';
        }
    }

    /*$scope.clear = function() {
        $scope.BPchartConfig.series.splice(1,1);
    }*/

    $scope.BPchartConfig = {
        options: $scope.BPchartOptions,
        xAxis: {
            categories: $scope.getGraphLabels(1)[0]
        },
        yAxis: {
            plotLines: [
            {
                color: 'blue',
                width: 2,
                value: 120,
                dashStyle: 'longdashdot'               
            },
            {
                color: 'black',
                width: 2,
                value: 80,
                dashStyle: 'longdashdot' 
            }
            ]
        },
        series: [{
            name: 'Systolic',
            data: $scope.getGraphData(1)[0]
        },
        {
            name: 'Diastolic',
            data: $scope.getGraphData(1)[1]
        }
        ],
        title: {
            text: "Blood Pressure(mmHg)"
        },
        loading: false
    };

    $scope.WchartOptions = {
        chart: {
            type: 'line'
        }
    }; 
    $.extend($scope.WchartOptions, chartOptions);
    $scope.Wvisible = false;
    $scope.Wtoggle = function() {
        $scope.Wvisible = !$scope.Wvisible;
    }
    $scope.WchartConfig = {
        options: $scope.WchartOptions,
        xAxis: {
            categories: $scope.getGraphLabels(2)[0]
        },
        series: [{
            name: 'Weight',
            data: $scope.getGraphData(2)[0]
        }
        ],
        title: {
            text: "Weight(kg)"
        },
        loading: false
    };

    $scope.BGchartOptions = {
        chart: {
            type: 'line'
        }
    };
    $.extend($scope.BGchartOptions, chartOptions);
    $scope.BGvisible = false;
    $scope.BGtoggle = function() {
        $scope.BGvisible = !$scope.BGvisible;
    }
    $scope.BGchartConfig1 = {
        options: $scope.BGchartOptions,
        xAxis: {
            categories: $scope.getGraphLabels(3)[0]
        },
        series: [{
            name: 'Morning',
            data: $scope.getGraphData(3)[0]
        }
        ],
        title: {
            text: "Blood Glucose(mmol/L)"
        },
        loading: false
    };

    $scope.BGchartConfig2 = {
        options: $scope.BGchartOptions,
        xAxis: {
            categories: $scope.getGraphLabels(3)[1]
        },
        series: [{
            name: 'Afternoon',
            data: $scope.getGraphData(3)[1]
        }
        ],
        title: {
            text: "Blood Glucose(mmol/L)"
        },
        loading: false
    };

    $scope.TchartOptions = {
        chart: {
            type: 'line'
        }
    }; 
    $.extend($scope.TchartOptions, chartOptions);
    $scope.Tvisible = false;
    $scope.Ttoggle = function() {
        $scope.Tvisible = !$scope.Tvisible;
    }
    $scope.TchartConfig = {
        options: $scope.TchartOptions,
        xAxis: {
            categories: $scope.getGraphLabels(4)[0]
        },
        yAxis: {
            plotLines: [
            {
                color: 'blue',
                width: 2,
                value: 37.0,
                dashStyle: 'longdashdot'               
            }
            ]
        },
        series: [{
            name: 'Temperature',
            data: $scope.getGraphData(4)[0]
        }
        ],
        title: {
            text: "Temperature(°C)"
        },
        loading: false
    };
}