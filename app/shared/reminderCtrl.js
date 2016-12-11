app.controller('reminderCtrl', function ($scope, $rootScope, ReminderService) {
    $scope.setReminders = function(duration) {
    	ReminderService.registerReminders(duration);
    }

    $scope.clearReminders = function() {
    	ReminderService.unregisterReminders();
    }
});