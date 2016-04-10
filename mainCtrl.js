app.controller('mainCtrl', function ($scope, $rootScope, $location, remindersRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.$on('$routeChangeStart', function(next, current) { 
		if(current.originalPath == "/login") {
			$scope.showMainContent = false;
			$scope.showWeather = false;
		} else {
			$scope.showMainContent = true;
			$scope.showWeather = true;
		}
	});

	remindersRepository.getReminders()
	.success(function(data) {
		$scope.questionnaires = data.questionnaires;
		$scope.measurements = data.measurements;
		$scope.checkReminders();
		$scope.registerReminders();
	})
	.error(function() {
		bootbox.alert("<div class='text-danger'>Failed loading reminders.</div>");
	});

	$scope.registerReminders = function() {
		$scope.reminderInterval = setInterval(function () {
			$scope.checkReminders();
		}, 10000); 
	}

    $scope.checkReminders = function() {
    	var dailyReminders = [],
    	    hourlyReminders = [],
    	    dailyMessage = "",
    	    hourlyMessage = "";

		angular.forEach($scope.questionnaires, function(reminder, i) {
			var questionnaireReminder = $scope.checkReminder(reminder);
			if(questionnaireReminder.daily) {
				dailyReminders.push(reminder.name);
			}
			if(questionnaireReminder.hourly) {
				hourlyReminders.push(reminder.name);
			}
		});

		if(dailyReminders.length) {
			dailyMessage += "<div>You have following questionnaires</div><div class='text text-info' style='margin-left: 20px;'>" + dailyReminders.toString() + ".</div>";
		}

		if(hourlyReminders.length) {
			hourlyMessage += "<div>You have following questionnaires</div><div class='text text-danger' style='margin-left: 20px;'>" + hourlyReminders.toString() + ".</div>";
		}

		dailyReminders = [];
		hourlyReminders = [];

		angular.forEach($scope.measurements, function(reminder, i) {
			var measurementReminder = $scope.checkReminder(reminder);
			if(measurementReminder.daily) {
				dailyReminders.push(reminder.name);
			}
			if(measurementReminder.hourly) {
				hourlyReminders.push(reminder.name);
			}
		});

		if(dailyReminders.length) {
			dailyMessage += "<div>You have following measurements:</div><div class='text text-info' style='margin-left: 20px;'>" + dailyReminders.toString() + ".</div>";
		}

		if(hourlyReminders.length) {
			hourlyMessage += "<div>You have following measurements</div><div class='text text-danger' style='margin-left: 20px;'>" + hourlyReminders.toString() + ".</div>";
		}

		if(dailyMessage)
			bootbox.alert($rootScope.Patient.firstName + ", " + dailyMessage + "<div>scheduled for tomorrow.</div>");

		if(hourlyMessage)
			bootbox.alert($rootScope.Patient.firstName + ", " + hourlyMessage + "<div>due in an hour.</div>");
    }

	$scope.checkReminder = function(reminder) {
		var daily = false,
		    hourly = false,
		    currentDate = moment(reminder.dateTime),
		    dayLater = moment().add(1, 'days').startOf('day'),
		    hourLater = moment().add(1, 'hours');

		// check if something is due tomorrow
		if(currentDate.year() == dayLater.year() && currentDate.date() == dayLater.date()) {
			daily = true;
		}

		// check if something is due in an hour
		if(currentDate.year() == hourLater.year() && currentDate.date() == hourLater.date() && currentDate.hour() == hourLater.hour() && currentDate.minute() == hourLater.minute()) {
			hourly = true;
		}

		return {
			daily: daily,
			hourly: hourly
		};
	}
});