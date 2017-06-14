app.factory('ReminderService', function ($rootScope, $q, localStorageService, diaryRepository, questionnairesRepository, medicationsRepository, helper, AccountService) {
    var self = this;

    this.interval = null;
    this.appointmentsData = null;
    this.questionnaires = [];
    this.appointments = [];
    this.medications = [];
    this.measurements = [];
    this.token = null;

    this.getQuestionnaireReminders = function() {
        if(!$rootScope.patient)
            return; 
        
        return questionnairesRepository.getQuestionnaires($rootScope.patient && $rootScope.patient.user.cloudRef, self.getQueryParams("q"), self.token)
        .then(function(response) {
          return questionnairesRepository.decodeQuestionnaires(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef); 
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
            promises.push(questionnairesRepository.getQuestionnaireByRef(ref, self.token));
        });

        return $q.all(promises);
    }

    this.getQuestionnaires = function(questionnaires) {
        var promises = [];
        angular.forEach(questionnaires, function(questionnaire) {
            promises.push(questionnairesRepository.decodeQuestionnaire(questionnaire.data));
        });

        return $q.all(promises);
    }

    this.getAppointmentReminders = function() {
        if(!$rootScope.patient)
            return; 

        return diaryRepository.getAppointments($rootScope.patient && $rootScope.patient.user.cloudRef, self.getQueryParams("a"), self.token)
        .then(function(response) {
          return diaryRepository.decodeAppointments(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef); 
        })
        .then(function(appointmentRefs) {
          return self.getAppointmentUriPromises(appointmentRefs); 
        })
        .then(function(appointments) {
          return self.getAppointments(appointments);
        })
        .then(function(results) {
          self.appointmentsData = results;

          return self.getAppointmentHCPData(results);
        })
        .then(function(hcpRefs) {
          return self.getAppointmentHCPs(hcpRefs);
        })
        .then(function(hcps) {
            self.appointments = self.parseAppointments(self.appointmentsData, hcps);
        });
    }

    this.getAppointmentUriPromises = function(refs) {
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(diaryRepository.getAppointmentByRef(ref, self.token));
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

    this.getAppointmentHCPData = function(appointments) {
        var promises = [];
        angular.forEach(appointments, function(appointment) {
          promises.push(diaryRepository.getHCPByRef(appointment.hcpRef, self.token));
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

    this.getMedicationReminders = function() {
      return medicationsRepository.getMedications($rootScope.patient && $rootScope.patient.user.cloudRef, self.getQueryParams("m"), self.token)
      .then(function(response) {
        return medicationsRepository.decodeMedications(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef);
      })
      .then(function(prescriptionRefs) {
        return self.getMedicationUriPromises(prescriptionRefs);
      })
      .then(function(prescriptions) {
        return self.getMedications(prescriptions);
      })
      .then(function(results) {
        self.medications = self.parseMedications(results);
      });
    }
    
    this.getMedicationUriPromises = function(refs) {  
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(medicationsRepository.getMedicationByRef(ref, self.token));
        });

        return $q.all(promises);
    }

    this.getMedications = function(medications) {
        var promises = [];
        angular.forEach(medications, function(medication) {
            promises.push(medicationsRepository.decodeMedication(medication.data));
        });

        return $q.all(promises);
    }

    this.getDeviceReminders = function() {
        if(!$rootScope.patient)
            return; 

        return diaryRepository.getDevices($rootScope.patient && $rootScope.patient.user.cloudRef, self.token)
        .then(function(response) {
            return diaryRepository.decodeDevices(response.data, $rootScope.patient && $rootScope.patient.user.cloudRef)
        })
        .then(function(deviceRefs) {
            return self.getDeviceUriPromises(deviceRefs);
        })
        .then(function(response) {
            return self.decodeDevices(response);
        })
        .then(function(deviceRequestRefs) {
            var nonEmptyRefs = [];
            angular.forEach(deviceRequestRefs, function(refArray) {
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
            promises.push(diaryRepository.getDeviceByRef(ref, self.getQueryParams("d"), self.token));
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
            promises.push(diaryRepository.getDeviceRequestByRef(ref, self.token));
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

    this.getQueryParams = function(mode) { 
        if(mode == "a") {
            var params = "?q=Period.end,afterEq," +  helper.formatDateForServer(moment());
        } else if (mode == "m") {
            var params = "?q=MedicationPrescription.dosageInstruction.scheduled/Timing.repeat/Timing.repeat.bounds/Period.end,afterEq," +  helper.formatDateForServer(moment());
        } else if (mode == "d") {
            var params = "?q=Timing.repeat/Timing.repeat.bounds/Period.end,afterEq," +  helper.formatDateForServer(moment());
        } else if (mode == "q") {
            var params = "?q=Timing.repeat.bounds/Period.end,afterEq," +  helper.formatDateForServer(moment());
        } else {
            return;
        }
        
        return params;
    }

    this.initRemindersInterval = function() {
        self.clearReminders();
        var interval = $rootScope.currentUser ? localStorageService.get('reminders-' + $rootScope.currentUser.username) : null;
        $rootScope.reminderInterval = interval || 3600000;
    }

    this.setReminders = function(interval) {
        if(!interval || interval < 1)
            return;

        self.clearReminders();
        self.setInterval(interval);
        $rootScope.reminderInterval = interval;
        localStorageService.set('reminders-' + $rootScope.currentUser.username, $rootScope.reminderInterval);
    }

    this.clearReminders = function() {
        self.clearInterval();
    }

    this.removeReminders = function() {
        self.clearReminders();
        $rootScope.reminderInterval = null;
        localStorageService.remove('reminders-' + $rootScope.currentUser.username);
    }

    this.disableReminders = function() {
        self.clearReminders();
        $rootScope.reminderInterval = -1;
        localStorageService.set('reminders-' + $rootScope.currentUser.username, $rootScope.reminderInterval);
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
        self.medications.length = 0;
        self.measurements.length = 0;
    }

    this.checkReminders = function() {
        var todayReminders = [],
            tomorrowReminders = [],
            message = "";

        angular.forEach(self.questionnaires, function(reminder, i) {
            var questionnaireReminder = self.checkReminder(reminder.start);
            if(questionnaireReminder.isToday) {
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(questionnaireReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow at " + helper.formatTimeForUser(new Date(reminder.start)));
            }
        });

        angular.forEach(self.appointments, function(reminder, i) {
            var appointmentReminder = self.checkReminder(reminder.start);
            if(appointmentReminder.isToday) {
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(appointmentReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow at " + helper.formatTimeForUser(new Date(reminder.start)));
            }
        });

        angular.forEach(self.medications, function(reminder, i) {
            var medicationReminder = self.checkReminder(reminder.start);
            if(medicationReminder.isToday) {
                todayReminders.push(reminder.fullTitle + " to be taken in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(medicationReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " to be taken tomorrow at " + helper.formatTimeForUser(new Date(reminder.start)));
            }
        });

        angular.forEach(self.measurements, function(reminder, i) {
            var measurementReminder = self.checkReminder(reminder.start);
            if(measurementReminder.isToday) {
                todayReminders.push(reminder.fullTitle + " is due in " + moment.duration(moment().diff(reminder.start)).humanize());
            }
            if(measurementReminder.isTomorrow) {
                tomorrowReminders.push(reminder.fullTitle + " is due tomorrow at " + helper.formatTimeForUser(new Date(reminder.start)));
            }
        });

      	angular.forEach(todayReminders, function(reminder) {
      		message += "<p>" + reminder + "</p>";
      	});

        if(message)
      	    message += "<hr />";

      	angular.forEach(tomorrowReminders, function(reminder) {
      		message += "<p>" + reminder + "</p>";
      	});
        
        if(message)
            bootbox.alert("<div class='text-info'>" + message + "</div>");
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

    this.parseDates = function(data) {
        var dates = [],
            timings = [],
            period = data.period,
            periodUnit = data.periodUnit,
            start = moment(data.periodStart),
            end = moment(data.periodEnd),
            current = start;

        while(current < end) {
          dates = dates.concat(self.addTimings(current, data.timingEvents));
          current = self.addPeriod(current, period, periodUnit);
        }
        dates = dates.concat(self.addTimings(end, data.timingEvents));

        return dates;
    }
 
    this.addPeriod = function(date, period, periodUnit) {
        return moment(date).add(period, periodUnit);
    }

    this.addTimings = function(date, timings) {
        var dateTimes = [];
        $.each(timings, function(i, timing) {
            var tempDate = moment(date);
            var dateTime = tempDate.set({
                'hour': moment(timing).get('hour'),
                'minute': moment(timing).get('minute'),
                'second': moment(timing).get('second')
              });

          dateTimes.push(dateTime);
        });

        return dateTimes;
    }

    this.parseQuestionnaires = function(data) {
        var parsedData = [];
        angular.forEach(data, function(value, key) {
            var dates = self.parseDates(value);
            angular.forEach(dates, function(date) {
                var parsedObject = {},
                    mappedQuestionnaire = $.grep(helper.questionnaireMappings, function(mapping) { return mapping.id == value.id; })[0];
        
                parsedObject.title = mappedQuestionnaire && mappedQuestionnaire.name || value.questionnaire;
                parsedObject.fullTitle = "Questionnaire " + parsedObject.title;
                parsedObject.start = date;
                parsedData.push(parsedObject);
            });
        });

        return parsedData;
    }
       
    this.parseAppointments = function(data, hcpData) {
        var parsedData = [];

        angular.forEach(data, function(value, key) {
            var parsedObject = {};
            parsedObject.title = value.comment;
            parsedObject.fullTitle = "Appointment " + value.comment + " with " + hcpData[key].specialty + " " + hcpData[key].user.firstName + " " + hcpData[key].user.lastName + " - " + value.status;
            parsedObject.start = moment(value.periodStart);
            parsedData.push(parsedObject);
        });

        return parsedData;
    }

    this.parseMedications = function(data) {
        var parsedData = [];
        angular.forEach(data, function(value, key) {
            var dates = self.parseDates(value);
            angular.forEach(dates, function(date) {
                var parsedObject = {};
                parsedObject.title = value.medication;
                parsedObject.fullTitle = "Medication " + value.medication;
                parsedObject.start = date;
                parsedData.push(parsedObject);
            });
        });

        return parsedData;
    }

    this.parseDevices = function(data) {
        var parsedData = [],
            devices = $rootScope.patient && $rootScope.patient.devices;

        angular.forEach(data, function(value, key) {
            var dates = self.parseDates(value),
                device = $.grep(devices, function(device) { return device.cloudRef == value.device; })[0],
                type = device && device.type;

            angular.forEach(dates, function(date) {
                var parsedObject = {};
                parsedObject.title = type && type.charAt(0).toUpperCase() + type.substr(1).toLowerCase();
                parsedObject.fullTitle = "Measurement " + parsedObject.title;
                parsedObject.start = date;
                parsedData.push(parsedObject);
            });
        });

        return parsedData;
    } 

    this.getReminders = function() {
        self.initRemindersInterval();
        if($rootScope.reminderInterval < 0)
            return;

        self.token = AccountService.getToken();
        return $q.all([self.getQuestionnaireReminders(), self.getAppointmentReminders(), self.getMedicationReminders(), self.getDeviceReminders()])
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