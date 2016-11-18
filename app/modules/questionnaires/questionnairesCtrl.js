app.controller('questionnairesCtrl', function($scope, $rootScope, $http, $base64, questionnairesRepository, $q) {
  $scope.$emit('body:class:add', "transparent");
  $scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;
vm = $scope;
  $scope.getAllStaticQuestionnaires = function(_callback) {
    $scope.loading = true;

    return questionnairesRepository.getAllStaticQuestionnaires()
    .success(function(data) {
      $scope.staticQuestionnaires = data.questionnaires;
      $scope.loading = false;
      _callback();
    });
  }

  $scope.getAllAssignedQuestionnaires = function() {
    $scope.loading = true;

    return questionnairesRepository.getAllAssignedQuestionnaires('welk', 'welk', $scope.patientId)
    .then(function(response) {
      return questionnairesRepository.decodeQuestionnaireOrders(response.data, $scope.patientId); 
    })
    .then(function(questionnaireOrderRefs) {
      return $scope.getQuestionnaireOrderUriPromises(questionnaireOrderRefs); 
    })
    .then(function(questionnaireOrders) {
      return $scope.getAllQuestionnaireOrders(questionnaireOrders);
    })
    .then(function(results) {
      $scope.parseData(results);
      $scope.loading = false;
    });
  }

  $scope.getQuestionnaireOrderUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
        promises.push(questionnairesRepository.getQuestionnaireOrderByRef('welk', 'welk', ref));
    });

    return $q.all(promises);
  }

  $scope.getAllQuestionnaireOrders = function(questionnaireOrders) {
    var promises = [];
    angular.forEach(questionnaireOrders, function(questionnaireOrder) {
        promises.push(questionnairesRepository.decodeQuestionnaireOrder(questionnaireOrder.data));
    });

    return $q.all(promises);
  }
  
  $scope.parseData = function(questionnaires) {
    var activeAssignedQuestionnaires = [];
    angular.forEach(questionnaires, function(questionnaire) {
      if(activeAssignedQuestionnaires.indexOf(questionnaire.title) == -1) {
        var activeDates = $.grep(questionnaire.eventDates, function(eventDate) { return moment(eventDate, "YYYY-MM-DD HH:mm").diff(moment()) > 0; });
        if(activeDates && activeDates.length)
          activeAssignedQuestionnaires.push(questionnaire.title); 
      }
    });
    $scope.mergeData(activeAssignedQuestionnaires);
  }

  $scope.mergeData = function(questionnaires) {
    $scope.assignedQuestionnaires = $scope.staticQuestionnaires;//$.grep($scope.staticQuestionnaires, function(questionnaire) { return questionnaires.indexOf(questionnaire.id) != -1; });
  }

  $scope.setSelectedQuestionnaire = function(questionnaire) {
    $scope.selectedQuestionnaire = questionnaire;
    $scope.selectedQuestionnaire.answers = [];
  }

  $scope.calculateTotalScore = function() {
    if(!$scoe.selectedQuestionnaire)
      return;
    
    var score = 0;
    angular.forEach($scope.selectedQuestionnaire.answers, function(answer, key) {
      score += parseInt(answer.answer);
    });

    return score;
  }

  $scope.submit = function() {
    if(!$scope.selectedQuestionnaire)
      return;
    var answers = $scope.selectedQuestionnaire.answers;
    if(!$scope.patientId) {
      bootbox.alert("<div class='text-danger'>No patient ID defined!</div>");
      return;
    }
    if(!answers.length){ 
      bootbox.alert("<div class='text-danger'>Please select at least one answer!</div>");
      return;
    }
    if(answers.length && answers.length != $scope.selectedQuestionnaire.group.questions.length) {
      bootbox.alert("<div class='text-danger'>Please give answers to all the questions!</div>");
      return;
    }

    $scope.loading = true;
    CloudService.postQuestionnaire('welk','welk', $scope.patientId, $scope.selectedQuestionnaire.id, $scope.calculateTotalScore())
      .success(function(data) {
        $scope.loading = false;
        bootbox.alert("<div class='text-info'>Your questionnaire has been submitted successfully!</div>");
        var index = $scope.questionnaires.indexOf($scope.selectedQuestionnaire);
        $scope.questionnaires.splice(index, 1);
        
        if($scope.questionnaires[index-1])
          $scope.setSelectedQuestionnaire($scope.questionnaires[index-1]);
        else if($scope.questionnaires[index])
          $scope.setSelectedQuestionnaire($scope.questionnaires[index]);
        else 
          $scope.setSelectedQuestionnaire(null);
      })
      .error(function() {
        $scope.loading = false;
        bootbox.alert("<div class='text-danger'>Error while submitting questionnaire. If this continues please contact support.</div>");
      });
  }

  $scope.refresh = function() {
    $scope.getQuestionnaires();
  }

  $scope.getQuestionnaires = function() {
    $scope.getAllStaticQuestionnaires($scope.getAllAssignedQuestionnaires);
  }

  $scope.getQuestionnaires();
  
});
