app.controller('reminderCtrl', function ($scope, $rootScope, ReminderService) {
    $scope.setInterval = function(duration) {
    	ReminderService.registerReminders(duration);
    }

    $scope.clearInterval = function() {
    	ReminderService.unregisterReminders();
    }
});