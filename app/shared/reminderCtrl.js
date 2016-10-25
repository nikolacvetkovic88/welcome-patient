app.controller('reminderCtrl', function ($scope, $rootScope, ReminderService) {
    $scope.setInterval = function(duration) {
    	ReminderService.unregisterReminders();
    	$rootScope.reminderInterval = duration;
    	ReminderService.registerReminders(duration);
    }

    $scope.clearInterval = function() {
    	$rootScope.reminderInterval = 0;
    	ReminderService.unregisterReminders();
    }
});