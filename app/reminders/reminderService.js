app.factory('ReminderService', function ($rootScope, $http, $q, $cookieStore, diaryRepository) {
    var self = this;

    this.interval = null;
    this.appointmentsData = null;
    this.questionnaires = [];
    this.appointments = [];
    this.measurements = [];

    this.getQuestionnaireReminders = function() {
        if(!$rootScope.patient)
            return; 
        
        self.initRemindersInterval();
        if($rootScope.reminderInterval < 0)
            return;

        return diaryRepository.getQuestionnaires('welk', 'welk', $rootScope.patient && $rootScope.patient.user.cloudRef, formatDateForServer(moment()))
        .then(function(response) {
          return diaryRepository.decodeQuestionnaires(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef); 
        })
        .then(function(questionnaireRefs) {
          return self.getQuestionnaireUriPromises(questionnaireRefs); 
        })
        .then(function(questionnaires) {
          return self.getQuestionnaires(questionnaires);
        })
        .then(function(results) {
            self.questionnaires = self.parseQuestionnaires(results);
        });
    }

    this.getQuestionnaireUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(DiaryRepository.getQuestionnaireByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getQuestionnaires = function(questionnaires) {
        var promises = [];
        angular.forEach(questionnaires, function(questionnaire) {
            promises.push(diaryRepository.decodeQuestionnaire(questionnaire.data));
        });

        return $q.all(promises);
    }

    this.getAppointmentReminders = function() {
        if(!$rootScope.patient)
            return; 

        return diaryRepository.getAppointments('welk', 'welk', $rootScope.patient && $rootScope.patient.user.cloudRef, formatDateForServer(moment()))
        .then(function(response) {
          return diaryRepository.decodeAppointments(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef); 
        })
        .then(function(appointmentRefs) {
          return self.getAppointmentUriPromises(appointmentRefs); 
        })
        .then(function(appointments) {
          return self.getAppointments(appointments);
        })
        .then(function(appointments) {
          self.appointmentsData = appointments;
          return self.getAppointmentHCPData(appointments);
        })
        .then(function(hcpRefs) {
          return self.getAppointmentHCPs(hcpRefs);
        })
        .then(function(results) {
            self.appointments = self.parseAppointments(self.appointmentsData, results);
        });
    }

    this.getAppointmentHCPData = function(appointments) {
        var promises = [];
        angular.forEach(appointments, function(appointment) {
          promises.push(diaryRepository.getHCPByRef(appointment.hcpRef));
        });

        return $q.all(promises);
    }

    this.getAppointmentHCPs = function(appointments) {
        var promises = [];
        angular.forEach(appointments, function(appointment) {
          promises.push(appointment.data);
        });

        return $q.all(promises);
    }

    this.getAppointmentUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getAppointmentByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getAppointments = function(appointments) {
        var promises = [];
        angular.forEach(appointments, function(appointment) {
            promises.push(diaryRepository.decodeAppointment(appointment.data));
        });

        return $q.all(promises);
    }

    this.getDeviceReminders = function() {
        if(!$rootScope.patient)
            return; 

        return diaryRepository.getDevices('welk', 'welk', $rootScope.patient && $rootScope.patient.user.cloudRef, formatDateForServer(moment()))
        .then(function(response) {
            return diaryRepository.decodeDevices(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef)
        })
        .then(function(deviceRefs) {
            return self.getDeviceUriPromises(deviceRefs);
        })
        .then(function(response) {
            return self.decodeDevices(response);
        })
        .then(function(deviceEntryRefs) {
            var nonEmptyRefs = [];
            angular.forEach(deviceEntryRefs, function(refArray) {
                angular.forEach(refArray, function(ref) {
                    nonEmptyRefs.push(ref);
                });
            })

            return self.getDeviceRequestUriPromises(nonEmptyRefs);
        })
        .then(function(devices) {
            return self.getDeviceRequests(devices);
        })
        .then(function(results) {
            self.measurements = self.parseDevices(results);
        });
    }

    this.getDeviceUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getDeviceByRef('welk', 'welk', ref, formatDateForServer(moment())));
        });

        return $q.all(promises);
    }

    this.decodeDevices = function(deviceRefs) {
        var promises = [];
        angular.forEach(deviceRefs, function(ref) {
            promises.push(diaryRepository.decodeDevice(ref.data));
        });

        return $q.all(promises);
    }

    this.getDeviceRequestUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getDeviceRequestByRef ('welk', 'welk', ref));
        });

        return $q.all(promises);
    }

    this.getDeviceRequests = function(deviceDiaries) {
        var promises = [];
        angular.forEach(deviceDiaries, function(deviceDiary) {
            promises.push(diaryRepository.decodeDeviceRequest(deviceDiary.data));
        });

        return $q.all(promises);
    }

    this.initRemindersInterval = function() {
        self.clearReminders();
        var interval = $rootScope.currentUser ? $cookieStore.get('reminders-' + $rootScope.currentUser.username) : null;
        $rootScope.reminderInterval = interval || 3600000;
    }

    this.setReminders = function(interval) {
        if(!interval || interval < 1)
            return;

        self.clearReminders();
        self.setInterval(interval);
        $rootScope.reminderInterval = interval;
        $cookieStore.put('reminders-' + $rootScope.currentUser.username, $rootScope.reminderInterval);
    }

    this.clearReminders = function() {
        self.clearInterval();
    }

    this.removeReminders = function() {
        self.clearReminders();
        $rootScope.reminderInterval = null;
        $cookieStore.remove('reminders-' + $rootScope.currentUser.username);
    }

    this.disableReminders = function() {
        self.clearReminders();
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
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(questionnaireReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow");
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
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(measurementReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow");
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
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(measurementReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow");
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

    this.parseQuestionnaires = function(data) {
        var parsedData = [];

        angular.forEach(data, function(value) {
            var parsedObject = {};
            parsedObject.fullTitle = "Questionnaire " + value.questionnaire;
            parsedObject.start = moment(value.periodStart);
            parsedData.push(parsedObject);
        });

        return parsedData;
    } 

    this.parseDevices = function(data) {
        var parsedData = [];

        angular.forEach(data, function(value) {
            var parsedObject = {};
            parsedObject.fullTitle = "Measurement " + value.device;
            parsedObject.start = moment(value.periodStart);
            parsedData.push(parsedObject);
        });

        return parsedData;
    } 

    this.parseAppointments = function(data, hcpData) {
        var parsedData = [];

        angular.forEach(data, function(value, key) {
            var parsedObject = {};
            parsedObject.fullTitle = "Appointment " + value.comment + " with " + hcpData[key].specialty + " " + hcpData[key].user.firstName + " " + hcpData[key].user.lastName + " - " + value.status;
            parsedObject.start = moment(value.periodStart);
            parsedData.push(parsedObject);
        });

        return parsedData;
    }

    this.getReminders = function() {
        return $q.all([self.getQuestionnaireReminders(), self.getAppointmentReminders(), self.getDeviceReminders()])
        .then(function() {
            self.checkReminders();
            self.setInterval($rootScope.reminderInterval);
        });
    }

    return {
        getReminders: function() {
            return self.getReminders();
        },
        setReminders: function(interval) {
            return self.setReminders(interval);
        },
        clearReminders: function() {
            return self.clearReminders();
        },
        disableReminders: function() {
            return self.disableReminders();
        }
    };
});