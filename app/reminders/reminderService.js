app.factory('ReminderService', function ($rootScope, $http, $q, $cookieStore, diaryRepository) {
    var self = this;

    this.interval = null;
    this.questionnaires = [];
    this.appointments = [];
    this.measurements = [];

    this.getReminders = function() {;
        self.clearInterval();
        self.initRemindersInterval();
        if($rootScope.reminderInterval < 0)
            return;
       
        return diaryRepository.getQuestionnaireDiaryEntries('welk', 'welk', $rootScope.patient.cloudRef)
        .then(function(response) {
            return diaryRepository.decodeQuestionnaireDiaryEntries(response.data, $rootScope.patient.cloudRef); 
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
                    self.setInterval(i$rootScope.reminderInterval);
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
        return diaryRepository.getAppointmentDiaryEntries('welk', 'welk', $rootScope.patient.cloudRef)
        .then(function(response) {
          return diaryRepository.decodeAppointmentDiaryEntries(response.data, $rootScope.patient.cloudRef); 
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
        return diaryRepository.getDevices('welk', 'welk', $rootScope.patient.cloudRef)
        .then(function(response) {
            return diaryRepository.decodeDevices(response.data, $rootScope.patient.cloudRef)
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

    this.initRemindersInterval = function() {
        var interval = $rootScope.currentUser ? $cookieStore.get('reminders-' + $rootScope.currentUser.username) : null;
        $rootScope.reminderInterval = interval || 3600000;
    }

    this.setReminders = function(interval) {
        if(!interval || interval < 1)
            return;

        self.clearInterval();
        self.setInterval(interval);
        $rootScope.reminderInterval = interval;
        $cookieStore.put('reminders-' + $rootScope.currentUser.username, $rootScope.reminderInterval);
    }

    this.removeReminders = function() {
        self.clearInterval();
        $rootScope.reminderInterval = null;
        $cookieStore.remove('reminders-' + $rootScope.currentUser.username);
    }

    this.disableReminders = function() {
        self.clearInterval();
        $rootScope.reminderInterval = -1;
        $cookieStore.put('reminders-' + $rootScope.currentUser.username, $rootScope.reminderInterval);
    }

    this.clearInterval = function() {
        clearInterval(self.interval);
        self.interval = null;
    }

    this.setInterval = function(interval) {
        self.interval = setInterval(function () {
            self.checkReminders();
        }, interval); 
    }

    this.clearData = function() {
        self.questionnaires.length = 0;
        self.appointments.length = 0;
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
      
        var message = todayMessage + '\r\n' + tomorrowMessage;
        if(todayMessage || tomorrowMessage)
            notify(message, "info");
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
        getReminders: function() {
            return self.getReminders();
        },
        setReminders: function(interval) {
            return self.setReminders(interval);
        },
        disableReminders: function() {
            return self.disableReminders();
        }
    };
});