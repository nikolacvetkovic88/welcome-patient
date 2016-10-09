app.controller('questionnairesCtrl', function($scope, $rootScope, $http, $base64, questionnairesRepository, $q) {
  $scope.$emit('body:class:add', "transparent");
  $scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;

  $scope.getAllStaticQuestionnaires = function() {
    $scope.loading = true;

    return questionnairesRepository.getAllStaticQuestionnaires()
    .then(function(response) {
      //console.log(response.data);
      $scope.loading = false;
    });
  }

  $scope.setSelectedQuestionnaire = function(questionnaire) {
    $scope.selectedQuestionnaire = questionnaire;
    $scope.selectedQuestionnaire.answers = [];
  }

  $scope.calculateTotalScore = function() {
    var score = 0;
    angular.forEach($scope.selectedQuestionnaire.answers, function(answer, key) {
      score += parseInt(answer.answer);
    });

    return score;
  }

  $scope.submit = function() {
    var answers = $scope.selectedQuestionnaire.answers;

    if(!$scope.patientId) {
      bootbox.alert("<div class='text-danger'>No patient ID defined!</div>");
      return;
    }

    if(!answers.length){ 
      bootbox.alert("<div class='text-danger'>Please select at least one answer!</div>");
      return;
    }

    if(answers.length && answers.length != $scope.selectedQuestionnaire.questions.length) {
      bootbox.alert("<div class='text-danger'>Please give answers to all the questions!</div>");
      return;
    }

    console.log($scope.calculateTotalScore());

    //$scope.loading = true;
  }

  $scope.getAllStaticQuestionnaires();



$scope.getQuestionnaireUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
      promises.push(questionnairesRepository.getQuestionnaire('welk', 'welk', ref.url));
    });

    return $q.all(promises);

    //return questionnairesRepository.getQuestionnaire('welk', 'welk', refs[0].url);
  }

  $scope.getAllQuestionnaires = function(questionnaires) {
    var promises = [];
    var i =0;
    angular.forEach(questionnaires, function(questionnaire) {
      console.log(questionnaire);
    });

    return $q.all(promises);
  }



$scope.getQuestionnaires = function() {
    $scope.loading = true;
    
    questionnairesRepository.getQuestionnaires('welk', 'welk')
    .then(function(response) {
      return questionnairesRepository.decodeQuestionnaires(response.data.results.bindings);
    })
    .then(function(questionnaireRefs) {
      return $scope.getQuestionnaireUriPromises(questionnaireRefs);
    })
    .then(function(questionnaires) {
      return $scope.getAllQuestionnaires(questionnaires);
    });
  }



$scope.getQuestionnaires();






});
