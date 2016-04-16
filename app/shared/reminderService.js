app.factory('ReminderService', function ($rootScope, $http) {
    var self = this;
    this.reminderInterval = null;
    this.questionnaires = [];
    this.measurements = [];

    this.getReminders = function() {
         var remindersUrl = "app/modules/testData/reminders.json";

        return $http.get(remindersUrl)  
        .success(function (data) {
            self.questionnaires = data.questionnaires;
            self.measurements = data.measurements;
            self.checkReminders();
            self.registerReminders();
        })
        .error(function() {
            bootbox.alert("<div class='text-danger'>Failed loading reminders.</div>");
        });
    }

    this.registerReminders = function() {
        self.reminderInterval = setInterval(function () {
            self.checkReminders();
        }, 3600000); 
    }

    this.clearReminderInterval = function() {
        clearInterval(self.reminderInterval);
        self.reminderInterval = null;
        self.questionnaires = [];
        self.measurements = [];
    }

    this.checkReminders = function() {
        var dailyReminders = [],
            hourlyReminders = [],
            dailyMessage = "",
            hourlyMessage = "";

        angular.forEach(self.questionnaires, function(reminder, i) {
            var questionnaireReminder = self.checkReminder(reminder);
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

        angular.forEach(self.measurements, function(reminder, i) {
            var measurementReminder = self.checkReminder(reminder);
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

    this.checkReminder = function(reminder) {
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

    return {
        registerReminders: function() {
            return self.getReminders();
        },
        unregisterReminders: function() {
            return self.clearReminderInterval();
        }
    };
});