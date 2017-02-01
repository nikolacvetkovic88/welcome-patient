app.controller('diaryCtrl', function($scope, $rootScope, $window, $q, diaryRepository, questionnairesRepository, medicationRepository) {
  $scope.$emit('body:class:add', "transparent");
  $scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
  $scope.eventSources = [];
  $scope.diaryToday = [];
  $scope.diaryTomorrow = [];

  $scope.getDiaryQuestionnaires = function() {
    return questionnairesRepository.getQuestionnaires($scope.patientId, $scope.start, $scope.end)
    .then(function(response) {
      return questionnairesRepository.decodeQuestionnaires(response.data, $scope.patientId); 
    })
    .then(function(questionnaireRefs) {
      return $scope.getQuestionnaireUriPromises(questionnaireRefs); 
    })
    .then(function(questionnaires) {
      return $scope.getQuestionnaires(questionnaires);
    })
    .then(function(results) {
      $scope.questionnaires = $scope.parseQuestionnaires(results);
    });
  }

  $scope.getQuestionnaireUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
      promises.push(questionnairesRepository.getQuestionnaireByRef(ref));
    });

    return $q.all(promises);
  }

  $scope.getQuestionnaires = function(questionnaireDiaries) {
    var promises = [];
    angular.forEach(questionnaireDiaries, function(questionnaireDiary) {
      promises.push(questionnairesRepository.decodeQuestionnaire(questionnaireDiary.data));
    });

    return $q.all(promises);
  }

  $scope.getDiaryAppointments = function() {
    return diaryRepository.getAppointments($scope.patientId, $scope.start, $scope.end)
    .then(function(response) {
      return diaryRepository.decodeAppointments(response.data, $scope.patientId); 
    })
    .then(function(appointmentRefs) {
      return $scope.getAppointmentUriPromises(appointmentRefs); 
    })
    .then(function(appointments) {
      return $scope.getAppointments(appointments);
    })
    .then(function(results) {
      $scope.appointmentsData = results;
      
      return $scope.getAppointmentHCPData(results);
    })
    .then(function(hcpRefs) {
      return $scope.getAppointmentHCPs(hcpRefs);
    })
    .then(function(hcps) {
      $scope.appointments = $scope.parseAppointments($scope.appointmentsData, hcps);
    });
  }

  $scope.getAppointmentUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(diaryRepository.getAppointmentByRef(ref));
    });

    return $q.all(promises);
  }

  $scope.getAppointments = function(appointmentDiaries) {
    var promises = [];
    angular.forEach(appointmentDiaries, function(appointmentDiary) {
        promises.push(diaryRepository.decodeAppointment(appointmentDiary.data));
    });

    return $q.all(promises);
  }

  $scope.getAppointmentHCPData = function(appointments) {
    var promises = [];
    angular.forEach(appointments, function(appointment) {
      promises.push(diaryRepository.getHCPByRef(appointment.hcpRef));
    });

    return $q.all(promises);
  }

  $scope.getAppointmentHCPs = function(appointments) {
    var promises = [];
    angular.forEach(appointments, function(appointment) {
      promises.push(appointment.data);
    });

    return $q.all(promises);
  }

  $scope.getDiaryMedications = function() {
      return medicationRepository.getMedications($scope.patientId, $scope.start, $scope.end)
      .then(function(response) {
        return medicationRepository.decodeMedications(response.data, $scope.patientId);
      })
      .then(function(prescriptionRefs) {
        return $scope.getMedicationUriPromises(prescriptionRefs);
      })
      .then(function(prescriptions) {
        return $scope.getMedications(prescriptions);
      })
      .then(function(results) {
        $scope.medications = $scope.parseMedications(results);
      });
  }
    
  $scope.getMedicationUriPromises = function(refs) {  
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(medicationRepository.getMedicationByRef(ref));
    });

    return $q.all(promises);
  }

  $scope.getMedications = function(medications) {
    var promises = [];
    angular.forEach(medications, function(medication) {
        promises.push(medicationRepository.decodeMedication(medication.data));
    });

    return $q.all(promises);
  }

  $scope.getDiaryDevices = function() {
    return diaryRepository.getDevices($scope.patientId)
    .then(function(response) {
      return diaryRepository.decodeDevices(response.data, $scope.patientId)
    })
    .then(function(deviceRefs) {
      return $scope.getDeviceUriPromises(deviceRefs);
    })
    .then(function(response) {
      return $scope.decodeDevices(response);
    })
    .then(function(deviceRequestRefs) {
      var nonEmptyRefs = [];
      angular.forEach(deviceRequestRefs, function(refArray) {
        angular.forEach(refArray, function(ref) {
          nonEmptyRefs.push(ref);
        });
      })

      return $scope.getDeviceRequestUriPromises(nonEmptyRefs);
    })
    .then(function(devices) {
      return $scope.getDeviceRequests(devices);
    })
    .then(function(results) {
      $scope.measurements = $scope.parseDevices(results);
    });
  }

  $scope.getDeviceUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(diaryRepository.getDeviceByRef(ref, $scope.start, $scope.end));
    });

    return $q.all(promises);
  }

  $scope.decodeDevices = function(deviceRefs) {
    var promises = [];
    angular.forEach(deviceRefs, function(ref) {
      promises.push(diaryRepository.decodeDevice(ref.data));
    });

    return $q.all(promises);
  }

  $scope.getDeviceRequestUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
      promises.push(diaryRepository.getDeviceRequestByRef(ref, moment()));
    });

    return $q.all(promises);
  }

  $scope.getDeviceRequests = function(deviceDiaries) {
    var promises = [];
    angular.forEach(deviceDiaries, function(deviceDiary) {
      promises.push(diaryRepository.decodeDeviceRequest(deviceDiary.data));
    });

    return $q.all(promises);
  }

  $scope.parseQuestionnaires = function(data) {
    var parsedData = [];

    angular.forEach(data, function(value, key) {
      angular.forEach(value.timingEvents, function(timingEvent) {
        var parsedObject = {},
            date = moment(value.periodStart),
            dateTime = date.set({
              'hour': moment(timingEvent).get('hour'),
              'minute': moment(timingEvent).get('minute'),
              'second': moment(timingEvent).get('second')
            });

        parsedObject.title = value.questionnaire;
        parsedObject.fullTitle = helper.formatDateTimeForUser(dateTime) + " Questionnaire " + value.questionnaire;
        parsedObject.start = dateTime;
        parsedObject.color = "#3A87AD";
        parsedObject.mode = "q";
        parsedData.push(parsedObject);
      });
    });

    return parsedData;
  } 

  $scope.parseAppointments = function(data, hcpData) {
    var parsedData = [];

    angular.forEach(data, function(value, key) {
      var parsedObject = {};
      parsedObject.title = value.comment;
      parsedObject.fullTitle = helper.formatDateTimeForUser(value.periodStart) + " Appointment " + value.comment + " with " + hcpData[key].specialty + " " + hcpData[key].user.firstName + " " + hcpData[key].user.lastName + " - " + value.status;
      parsedObject.start = moment(value.periodStart);
      parsedObject.end = moment(value.periodEnd);
      parsedObject.color = "#00AEEF";
      parsedObject.mode = "appointment";
      parsedData.push(parsedObject);
    });

    return parsedData;
  }

  $scope.parseMedications = function(data) {
    var parsedData = [];

    angular.forEach(data, function(value, key) {
      angular.forEach(value.timingEvents, function(timingEvent) {
        var parsedObject = {},
            date = moment(value.periodStart),
            dateTime = date.set({
              'hour': moment(timingEvent).get('hour'),
              'minute': moment(timingEvent).get('minute'),
              'second': moment(timingEvent).get('second')
            });

        parsedObject.title = value.medication,
        parsedObject.fullTitle = helper.formatDateTimeForUser(dateTime) + " Medication " + value.medication + " - " + value.note;
        parsedObject.start = dateTime;
        parsedObject.color = "#00384D";
        parsedObject.mode = "medication";
        parsedData.push(parsedObject);
      });
    });

    return parsedData;
  }

  $scope.parseDevices = function(data) {
    var parsedData = [];

    angular.forEach(data, function(value, key) {
      angular.forEach(value.timingEvents, function(timingEvent) {
        var parsedObject = {},
            date = moment(value.periodStart),
            dateTime = date.set({
              'hour': moment(timingEvent).get('hour'),
              'minute': moment(timingEvent).get('minute'),
              'second': moment(timingEvent).get('second')
            });

        parsedObject.title = value.device;
        parsedObject.fullTitle = helper.formatDateTimeForUser(dateTime) + " Measurement " + value.device;
        parsedObject.start = dateTime;
        parsedObject.color = "#043248";
        parsedObject.mode = "measurement";
        parsedData.push(parsedObject);
      });
    });

    return parsedData;
  } 
   
  $scope.diaryEntriesTodayAndTomorrow = function(data) {
    $scope.diaryEntriesForDay($scope.diaryToday, data, moment());
    $scope.diaryEntriesForDay($scope.diaryTomorrow, data, moment().add(1, 'days'));
  }

  $scope.diaryEntriesForDay = function(context, data, compareToDate) {
    angular.forEach(data, function(value, key) {
      var date = moment(value.start, 'YYYY-MM-DD');
      if(compareToDate.isSame(date, 'year') && compareToDate.isSame(date, 'month') && compareToDate.isSame(date, 'day')){
        context.push({mode: value.mode, title: value.title, start: helper.formatDateForUser(value.start)});
      }
    });
  }

  $scope.addEvents = function(data) {
    $scope.eventSources.push(data);
  }

  $scope.onClick = function(date, jsEvent, view) {
    var mode = date.mode,
        location = null,
        message = "";

    switch (mode) {
      case "measurement":
        location = "patienthub://app";
        message = "Go to Measurements";
      break;
      case "questionnaire":
        location = "#questionnaire";
        message = "Go to Questionnaires"
      break;
      case "medication":
        location = "#medication";
        message = "Go to Medications";
      default:
        break;
    }

    if(mode == "appointment") {
      var dialog = bootbox.dialog({
        message: " ",
        title: "<div class='text-info'>" + date.fullTitle + "</div>",
        closeButton: false,
        buttons: {
          main: {
            label: "Go back",
            className: "btn-default",
            callback: function() {
              dialog.modal("hide");
            }
          }
        }
      });
    } else {
      var dialog = bootbox.dialog({
        message: message,
        title: "<div class='text-info'>" + date.fullTitle + "</div>",
        closeButton: false,
        buttons: {
          main: {
            label: "Cancel",
            className: "btn-default",
            callback: function() {
              dialog.modal("hide");
            }
          },
          success: {
            label: "Go",
            className: "btn-primary",
            callback: function() {
              $window.location.href = location;
            }
          }
        }
      });
    }
  }

  $scope.uiConfig = {
    calendar:{
      height: "auto",
      eventLimit: 2,
      draggable: false,
      editable: false,
      navlinks: true,
      header:{
        left: 'month, agendaWeek, agendaDay, listWeek, listDay',
        center: 'title',
        right: 'today, prev, next'
      },
      views: {
        listDay: { buttonText: 'list day' },
        listWeek: { buttonText: 'list week' }
      },
      timeFormat: '',
      eventClick: $scope.onClick,
      eventRender: function (event, element, view) {
        $(element).css("margin-bottom", "8px");
      },
      viewRender: function(view, element) {
        $scope.start = view.start;
        $scope.end = view.end;

        if($scope.canLoad())
          $scope.getDiaryEntries();
      }
    }    
  };

  $scope.resetData = function() {
    $scope.eventSources.length = 0;
    $scope.diaryToday.length = 0;
    $scope.diaryTomorrow.length = 0;
  }

  $scope.canLoad = function() {
    if(!$scope.startLoaded || !$scope.endLoaded)
      return true;

    return $scope.start >= $scope.startLoaded && $scope.end <= $scope.endLoaded ? false : true;
  }

  $scope.refresh = function() {
    $scope.getDiaryEntries();
  }
 
  $scope.getDiaryEntries = function() {
    $scope.resetData();
    $scope.loading = true;

    return $q.all([/*$scope.getDiaryQuestionnaires(),*/$scope.getDiaryAppointments(), $scope.getDiaryMedications(), $scope.getDiaryDevices()])
    .then(function() {
      //$scope.addEvents($scope.questionnaires); check out
      //$scope.diaryEntriesTodayAndTomorrow($scope.questionnaires);
      $scope.addEvents($scope.appointments);
      $scope.diaryEntriesTodayAndTomorrow($scope.appointments);
      $scope.addEvents($scope.medications);
      $scope.diaryEntriesTodayAndTomorrow($scope.medications);
      $scope.addEvents($scope.measurements);
      $scope.diaryEntriesTodayAndTomorrow($scope.measurements);

      $scope.startLoaded = $scope.start;
      $scope.endLoaded = $scope.end;
      $scope.loading = false;
    });
  }

});
