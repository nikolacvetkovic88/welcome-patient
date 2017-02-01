app.controller('reminderCtrl', function ($scope, ReminderService) {
    $scope.setReminders = function(duration) {
    	ReminderService.setReminders(duration);
    }

    $scope.disableReminders = function() {
    	ReminderService.disableReminders();
    }
});