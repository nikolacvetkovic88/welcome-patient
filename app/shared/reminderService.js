app.factory('ReminderService', function ($rootScope, $http, $q, diaryRepository) {
    var self = this;

    this.reminderInterval = null;
    this.questionnaires = [];
    this.measurements = [];
    this.appointments = [];

    this.getReminders = function() {
        diaryRepository.getQuestionnaireDiaryEntries('welk', 'welk', $rootScope.Patient.cloudRef)
        .then(function(response) {
            return diaryRepository.decodeQuestionnaireDiaryEntries(response.data, $rootScope.Patient.cloudRef); 
        })
        .then(function(questionnaireDiaryRefs) {
            return self.getQuestionnaireDiaryEntryUriPromises(questionnaireDiaryRefs); 
        })
        .then(function(questionnaireDiaries) {
            return self.getAllQuestionnaireDiaryEntries(questionnaireDiaries);
        })
        .then(function(results) {
            self.questionnaires = self.parseData(results, "q");
            self.getAppointments()
            .then(function(deviceResults) {
                self.appointments = self.parseData(results, "a");
                self.getDevices()
                .then(function() {
                    self.measurements = self.parseData(deviceResults, "m");
                    self.checkReminders();
                    self.registerReminders();
                });
            });
        });
    }

    this.getQuestionnaireDiaryEntryUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getQuestionnaireDiaryEntryByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getAllQuestionnaireDiaryEntries = function(questionnaireDiaries) {
        var promises = [];
        angular.forEach(questionnaireDiaries, function(questionnaireDiary) {
            promises.push(diaryRepository.decodeQuestionnaireDiaryEntry(questionnaireDiary.data));
        });

        return $q.all(promises);
    }

    this.getAppointments = function() {
        return diaryRepository.getAppointmentDiaryEntries('welk', 'welk', $rootScope.Patient.cloudRef)
        .then(function(response) {
          return diaryRepository.decodeAppointmentDiaryEntries(response.data, $rootScope.Patient.cloudRef); 
        })
        .then(function(appointmentDiaryRefs) {
          return self.getAppointmentDiaryEntryUriPromises(appointmentDiaryRefs); 
        })
        .then(function(appointmentDiaries) {
          return self.getAllAppointmentDiaryEntries(appointmentDiaries);
        });
    }

    this.getAppointmentDiaryEntryUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getAppointmentDiaryEntryByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getAllAppointmentDiaryEntries = function(appointmentDiaries) {
        var promises = [];
        angular.forEach(appointmentDiaries, function(appointmentDiary) {
            promises.push(diaryRepository.decodeAppointmentDiaryEntry(appointmentDiary.data));
        });

        return $q.all(promises);
    }

    this.getDevices = function() {
        return diaryRepository.getDevices('welk', 'welk', $rootScope.Patient.cloudRef)
        .then(function(response) {
            return diaryRepository.decodeDevices(response.data, $rootScope.Patient.cloudRef)
        })
        .then(function(deviceRefs) {
            return self.getDeviceUriPromises(deviceRefs);
        })
        .then(function(response) {
            return self.decodeDeviceEntries(response);
        })
        .then(function(deviceEntryRefs) {
            var nonEmptyRefs = [];
                angular.forEach(deviceEntryRefs, function(refArray) {
                    angular.forEach(refArray, function(ref) {
                        nonEmptyRefs.push(ref);
                    });
                })

            return self.getDeviceEntryUriPromises(nonEmptyRefs);
        })
        .then(function(deviceDiaries) {
            return self.getAllDeviceDiaryEntries(deviceDiaries);
        })
    }

    this.getDeviceUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getDeviceByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.decodeDeviceEntries = function(deviceRefs) {
        var promises = [];
        angular.forEach(deviceRefs, function(ref) {
            promises.push(diaryRepository.decodeDeviceEntry(ref.data));
        });

        return $q.all(promises);
    }

    this.getDeviceEntryUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getDeviceDiaryEntryByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getAllDeviceDiaryEntries = function(deviceDiaries) {
        var promises = [];
        angular.forEach(deviceDiaries, function(deviceDiary) {
            promises.push(diaryRepository.decodeDeviceDiaryEntry(deviceDiary.data));
        });

        return $q.all(promises);
    }

    this.registerReminders = function() {
        self.reminderInterval = setInterval(function () {
            self.checkReminders();
        }, 3600000); 
    }

    this.clearReminderInterval = function() {
        clearInterval(self.reminderInterval);
        self.reminderInterval = null;
        self.questionnaires.length = 0;
        self.measurements.length = 0;
    }

    this.checkReminders = function() {
        var todayReminders = [],
            tomorrowReminders = [],
            todayMessage = "",
            tomorrowMessage = "";

        angular.forEach(self.questionnaires, function(reminder, i) {
            var questionnaireReminder = self.checkReminder(reminder.start);
            if(questionnaireReminder.isToday) {
                todayReminders.push("Questionnaire " + reminder.title + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(questionnaireReminder.isTomorrow) {
                tomorrowReminders.push("Questionnaire " + reminder.title + " is due tomorrow");
            }
        });

        if(todayReminders.length) {
            todayMessage += todayReminders.toString() + ".";
        }

        if(tomorrowReminders.length) {
            tomorrowMessage += tomorrowReminders.toString() + ".";
        }

        todayReminders.length = 0;
        tomorrowReminders.length = 0;

        angular.forEach(self.appointments, function(reminder, i) {
            var measurementReminder = self.checkReminder(reminder.start);
            if(measurementReminder.isToday) {
                todayReminders.push("Appointment " + reminder.title + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(measurementReminder.isTomorrow) {
                tomorrowReminders.push("Appointment " + reminder.title + " is due tomorrow");
            }
        });

        if(todayReminders.length) {
            todayMessage += todayReminders.toString() + ".";
        }

        if(tomorrowReminders.length) {
            tomorrowMessage += tomorrowReminders.toString() + ".";
        }

        todayReminders.length = 0;
        tomorrowReminders.length = 0;

        angular.forEach(self.measurements, function(reminder, i) {
            var measurementReminder = self.checkReminder(reminder.start);
            if(measurementReminder.isToday) {
                todayReminders.push("Measurement " + reminder.title + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(measurementReminder.isTomorrow) {
                tomorrowReminders.push("Measurement " + reminder.title + " is due tomorrow");
            }
        });

        if(todayReminders.length) {
            todayMessage += todayReminders.toString() + ".";
        }

        if(tomorrowReminders.length) {
            tomorrowMessage += tomorrowReminders.toString() + ".";
        }
      
        var message = "<div class='text text-danger' style='margin-left: 20px;'>" + todayMessage + "</div>" + 
                      "<hr />" + "<div class='text text-info' style='margin-left: 20px;'>" + tomorrowMessage + "</div>";
        if(todayMessage || tomorrowMessage)
            bootbox.alert(message);
    }

    this.checkReminder = function(reminder) {
        var isTomorrow = false,
            isToday = false,
            today = moment();
            tomorrow = moment().add(1, 'days').startOf('day');

        // check if something is due tomorrow
        if(reminder.year() == tomorrow.year() && reminder.month() == tomorrow.month() && reminder.date() == tomorrow.date()) {
            isTomorrow = true;
        }

        // check if something is due in an hour
        if(reminder.year() == today.year() && reminder.month() == today.month() && reminder.date() == today.date()) {
            if(reminder.hour() > today.hour()) {
                isToday = true;
            } else if(reminder.hour() == today.hour()) {
                if(reminder.minute() > today.minute())
                    isToday = true;
            } else {
                isToday = false;
            }
        }

        return {
            isToday: isToday,
            isTomorrow: isTomorrow
        };
    }

    this.parseData = function(data, mode) {
        var parsedData = [];

        angular.forEach(data, function(value) {
          angular.forEach(value.eventDates, function(date) {
            var parsedObject = {};
            parsedObject.title = value.title;
            parsedObject.start = moment(date, "YYYY-MM-DD HH:mm");
            parsedObject.mode = mode;
            parsedData.push(parsedObject);
          });
        });

        return parsedData;
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