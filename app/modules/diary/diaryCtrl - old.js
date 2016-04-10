app.controller('diaryCtrl', function($scope, $window, diaryRepository) {
	$scope.$emit('body:class:add', "transparent");
    $scope.loading = true;
	$scope.calendar = $("#diary");
	$scope.source = {
		events: []
	};
	$scope.diaryEntries = null;

    diaryRepository.getAllDiaryEntries()
    .success(function(data) {
        $scope.loading = false;
        $scope.diaryEntries = data;
        $scope.addEvents();
    })
    .error(function() {
        $scope.loading = false;
        bootbox.alert("<div class='text-danger'>Failed loading diary entries.</div>");
        
    });

	$scope.appointments = function() {
		return $scope.parseData($scope.diaryEntries.appointments, "a");
	}

	$scope.measurements = function() {
		return $scope.parseData($scope.diaryEntries.measurements, "m");
	}

	$scope.questionnaires = function() {
		return $scope.parseData($scope.diaryEntries.questionnaires, "q");
	}

	$scope.parseData = function(data, mode) {
		var parsedData = [];

		angular.forEach(data,function(value, key){
			var parsedObject = {};
			parsedObject.title = value.name;
			parsedObject.start = value.dateTime;
			parsedObject.mode = mode;
			parsedData.push(parsedObject);
		});

		return parsedData;
	}

    $scope.getDiaryEntries = function(compareToDate) {
        var diaryEntries = [];

        angular.forEach($scope.appointments(), function(value, key) {
            var appointmentDate = moment(value.start, 'YYYY-MM-DD');

            if(compareToDate.isSame(appointmentDate, 'year') && compareToDate.isSame(appointmentDate, 'month') && compareToDate.isSame(appointmentDate, 'day')){
                diaryEntries.push({mode: value.mode, title: value.title, start: formatDateForUser(value.start)});
            }
        });
        angular.forEach($scope.measurements(), function(value, key) {
            var measurementDate = moment(value.start, 'YYYY-MM-DD');

            if(compareToDate.isSame(measurementDate, 'year') && compareToDate.isSame(measurementDate, 'month') && compareToDate.isSame(measurementDate, 'day')){
                diaryEntries.push({mode: value.mode, title: value.title, start: formatDateForUser(value.start)});
            }
        });
        angular.forEach($scope.questionnaires(), function(value, key) {
            var questionnaireDate = moment(value.start, 'YYYY-MM-DD');

            if(compareToDate.isSame(questionnaireDate, 'year') && compareToDate.isSame(questionnaireDate, 'month') && compareToDate.isSame(questionnaireDate, 'day')){
                diaryEntries.push({mode: value.mode, title: value.title, start: formatDateForUser(value.start)});
            }
        });

        return diaryEntries;
    }

    $scope.getDiaryEntriesToday = function() {
        var today = moment();

        return $scope.getDiaryEntries(today);
    }

    $scope.getDiaryEntriesTomorrow = function() {
        var tomorrow = moment().add(1, 'days');

        return $scope.getDiaryEntries(tomorrow);
    }

	$scope.addEvents = function() {
      $scope.source.events = $scope.appointments().concat($scope.questionnaires(), $scope.measurements());
      $scope.calendar.fullCalendar('addEventSource', $scope.source);
      $scope.diaryEntriesToday = $scope.getDiaryEntriesToday();
      $scope.diaryEntriesTomorrow = $scope.getDiaryEntriesTomorrow();
    }

    $scope.onClick = function( date, jsEvent, view) {
    	var mode = date.mode,
    	location = null;

    	switch (mode) {
    		case "m":
    		    location = "patienthub://app";
    		    break;
    		case "q":
    	     	location = "#questionnaires";
    		    break;
    		default:
    		    break;
    	}

    	if(mode == "m" || mode == "q") {
    		var dialog = bootbox.dialog({
    			message: mode == "m" ? "Go to Measurement" : "Go to Questionnaires",
    			title: "<div class='text-info'>" + date.title + "</div>",
    			closeButton: false,
    			buttons: {
    				main: {
    					label: "Cancel",
    					className: "btn-default",
    					callback: function() {
    						dialog.modal("hide");
    					}
    				},
    				success: {
    					label: "Go",
    					className: "btn-primary",
    					callback: function() {
    						$window.location.href = location;
    					}
    				}
    			}
    		});
    	} else if (mode == "a") {
            var dialog = bootbox.dialog({
                message: " ",
                title: "<div class='text-info'>" + date.title + "</div>",
                closeButton: false,
                buttons: {
                    main: {
                        label: "Go back",
                        className: "btn-default",
                        callback: function() {
                            dialog.modal("hide");
                        }
                    }
                }
            });
        }
    }

    $scope.changeView = function(view) {
    	$scope.calendar.fullCalendar('changeView',view);
    };

    angular.element(document).ready(function () {
    	$scope.calendar.fullCalendar({
    		height: "auto",
    		eventLimit: false,
    		draggable: false,
    		editable: false,
    		header:{
    			left: 'agendaDay, agendaWeek, month',
    			center: 'title',
    			right: 'today, prev, next'
    		},
    		timeFormat: '',
    		events: $scope.source,
    		eventClick: $scope.onClick,
            eventRender: function (event, element, view) {
                $(element).css("margin-bottom", "8px");
            }
    	});
    });

});
