app.controller('questionnairesCtrl', function($scope, $rootScope, $http, $base64, questionnairesRepository, CloudService) {
  $scope.$emit('body:class:add', "transparent");
  $scope.loading = true;
  $scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;

  questionnairesRepository.getAllQuestionnaires()
  .success(function(data) {
    $scope.questionnaires = data.questionnaires;
    if($scope.questionnaires[0])
      $scope.setSelectedQuestionnaire($scope.questionnaires[0]);
    
    $scope.loading = false;
    })
  .error(function() {
    $scope.loading = false;
    bootbox.alert("<div class='text-danger'>Failed loading questionnaires</div>");
    });

  $scope.setSelectedQuestionnaire = function(questionnaire) {
    $scope.selectedQuestionnaire = questionnaire;
    $scope.selectedQuestionnaire.answers = [];
  }

  $scope.submit = function() {
    var answers = $scope.selectedQuestionnaire.answers;

    if(!answers.length){ 
      bootbox.alert("<div class='text-danger'>Please select at least one answer!</div>");
      return;
    }
    if(!$scope.patientId) {
      bootbox.alert("<div class='text-danger'>No patient ID defined!</div>");
      return;
    }

    $scope.loading = true;
    CloudService.postQuestionnaire('welk','welk', $scope.patientId, answers, $scope.selectedQuestionnaire.questionnaire)
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

});
