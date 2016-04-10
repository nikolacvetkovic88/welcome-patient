app.factory('remindersRepository', function($http) {
	var remindersUrl = "app/modules/testData/reminders.json";

	return {
		getReminders: function() {
			return $http({
				method: 'GET',
				url: remindersUrl
			})
		}
	};

});