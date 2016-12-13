app.controller('reminderCtrl', function ($scope, $rootScope, ReminderService) {
    $scope.setReminders = function(duration) {
    	ReminderService.setReminders(duration);
    }

    $scope.disableReminders = function() {
    	ReminderService.disableReminders();
    }
});