app.controller('diaryCtrl', function($scope, $rootScope, $window, $q, diaryRepository) {
  $scope.$emit('body:class:add', "transparent");
  $scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;
  $scope.eventSources = [];
  $scope.diaryToday = [];
  $scope.diaryTomorrow = [];

  $scope.getQuestionnaireDiaryEntries = function(_callback) {
    $scope.loading = true;

    diaryRepository.getQuestionnaireDiaryEntries('welk', 'welk', $scope.patientId)
    .then(function(response) {
      return diaryRepository.decodeQuestionnaireDiaryEntries(response.data, $scope.patientId); 
    })
    .then(function(questionnaireDiaryRefs) {
      return $scope.getQuestionnaireDiaryEntryUriPromises(questionnaireDiaryRefs); 
    })
    .then(function(questionnaireDiaries) {
      return $scope.getAllQuestionnaireDiaryEntries(questionnaireDiaries);
    })
    .then(function(results) {
      $scope.questionnaires = $scope.parseData(results, "q");
      $scope.addEvents($scope.questionnaires);
      $scope.diaryEntriesTodayAndTomorrow($scope.questionnaires);
      $scope.loading = false;
      _callback();
    });
  }

  $scope.getQuestionnaireDiaryEntryUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(diaryRepository.getQuestionnaireDiaryEntryByRef('welk', 'welk', ref));
    });

    return $q.all(promises);
  }

  $scope.getAllQuestionnaireDiaryEntries = function(questionnaireDiaries) {
    var promises = [];
    angular.forEach(questionnaireDiaries, function(questionnaireDiary) {
        promises.push(diaryRepository.decodeQuestionnaireDiaryEntry(questionnaireDiary.data));
    });

    return $q.all(promises);
  }

  $scope.getDevices = function() {
    $scope.loading = true;

    diaryRepository.getDevices('welk', 'welk', $scope.patientId)
    .then(function(response) {
      return diaryRepository.decodeDevices(response.data, $scope.patientId)
    })
    .then(function(deviceRefs) {
      return $scope.getDeviceUriPromises(deviceRefs);
    })
    .then(function(response) {
      return $scope.decodeDeviceEntries(response);
    })
    .then(function(deviceEntryRefs) {
      var nonEmptyRefs = [];
      angular.forEach(deviceEntryRefs, function(refArray) {
        angular.forEach(refArray, function(ref) {
          nonEmptyRefs.push(ref);
        });
      })

      return $scope.getDeviceEntryUriPromises(nonEmptyRefs);
    })
    .then(function(deviceDiaries) {
      return $scope.getAllDeviceDiaryEntries(deviceDiaries);
    })
    .then(function(results) {
      $scope.devices = $scope.parseData(results, "m");
      $scope.addEvents($scope.devices);
      $scope.diaryEntriesTodayAndTomorrow($scope.devices);
      $scope.loading = false;
    });
  }

  $scope.getDeviceUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(diaryRepository.getDeviceByRef('welk', 'welk', ref));
    });

    return $q.all(promises);
  }

  $scope.decodeDeviceEntries = function(deviceRefs) {
    var promises = [];
    angular.forEach(deviceRefs, function(ref) {
        promises.push(diaryRepository.decodeDeviceEntry(ref.data));
    });

    return $q.all(promises);
  }

  $scope.getDeviceEntryUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(diaryRepository.getDeviceDiaryEntryByRef('welk', 'welk', ref));
    });

    return $q.all(promises);
  }

  $scope.getAllDeviceDiaryEntries = function(deviceDiaries) {
    var promises = [];
    angular.forEach(deviceDiaries, function(deviceDiary) {
        promises.push(diaryRepository.decodeDeviceDiaryEntry(deviceDiary.data));
    });

    return $q.all(promises);
  }

  $scope.parseData = function(data, mode) {
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

  $scope.diaryEntriesTodayAndTomorrow = function(data) {
    $scope.diaryEntriesForDay($scope.diaryToday, data, moment());
    $scope.diaryEntriesForDay($scope.diaryTomorrow, data, moment().add(1, 'days'));
  }

  $scope.diaryEntriesForDay = function(context, data, compareToDate) {
    angular.forEach(data, function(value, key) {
      var date = moment(value.start, 'YYYY-MM-DD');
      if(compareToDate.isSame(date, 'year') && compareToDate.isSame(date, 'month') && compareToDate.isSame(date, 'day')){
        context.push({mode: value.mode, title: value.title, start: formatDateForUser(value.start)});
      }
    });
  }

  $scope.addEvents = function(data) {
    $scope.eventSources.push(data);
  }

  $scope.onClick = function(date, jsEvent, view) {
    var mode = date.mode,
    location = null;

    switch (mode) {
      case "m":
      location = "patienthub://app";
      break;
      case "q":
      location = "#questionnaires";
      break;
      default:
      break;
    }

    if(mode == "m" || mode == "q") {
      var dialog = bootbox.dialog({
        message: mode == "m" ? "Go to Measurement" : "Go to Questionnaires",
        title: "<div class='text-info'>" + date.title + "</div>",
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
    } else if (mode == "a") {
      var dialog = bootbox.dialog({
        message: " ",
        title: "<div class='text-info'>" + date.title + "</div>",
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
    }
  }

  /* calendar config object */
  $scope.uiConfig = {
    calendar:{
      height: "auto",
      eventLimit: false,
      draggable: false,
      editable: false,
      header:{
        left: 'agendaDay, agendaWeek, month',
        center: 'title',
        right: 'today, prev, next'
      },
      timeFormat: '',
      eventClick: $scope.onClick,
      eventRender: function (event, element, view) {
        $(element).css("margin-bottom", "8px");
      }
    }    
  };

  $scope.resetData = function() {
    $scope.eventSources.length = 0;
    $scope.diaryToday.length = 0;
    $scope.diaryTomorrow.length = 0;
  }

  $scope.refresh = function() {
    $scope.getDiaryEntries();
  }
 
  $scope.getDiaryEntries = function() {
    $scope.resetData();
    $scope.getQuestionnaireDiaryEntries($scope.getDevices);
  }

  $scope.getDiaryEntries();
});
