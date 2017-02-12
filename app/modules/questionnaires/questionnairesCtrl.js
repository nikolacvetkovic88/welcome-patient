app.controller('questionnairesCtrl', function($scope, $rootScope, $q, questionnairesRepository, helper, AccountService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
	$scope.token = AccountService.getToken();

	$scope.getAllStaticQuestionnaires = function(_callback) {
		return questionnairesRepository.getStaticQuestionnaires()
		.success(function(data) {
			$scope.staticQuestionnaires = data.questionnaires;
		});
	}

	$scope.getAllAssignedQuestionnaires = function() {
		return questionnairesRepository.getQuestionnaires($scope.patientId, $scope.getQueryParams(), $scope.token)
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
			$scope.parseData(results);
		});
	}

	$scope.getQuestionnaireUriPromises = function(refs) {
		var promises = [];
		angular.forEach(refs, function(ref) {
			promises.push(questionnairesRepository.getQuestionnaireByRef(ref, $scope.token));
		});

		return $q.all(promises);
	}

	$scope.getQuestionnaires = function(questionnaires) {
		var promises = [];
		angular.forEach(questionnaires, function(questionnaire) {
			promises.push(questionnairesRepository.decodeQuestionnaire(questionnaire.data));
		});

		return $q.all(promises);
	}

	$scope.getQueryParams = function() {
        var params = "?q=Timing.repeat/Timing.repeat.bounds/Period.start,beforeEq," + helper.formatDateForServer(moment());
        params += "&q=Timing.repeat/Timing.repeat.bounds/Period.end,afterEq," +  helper.formatDateForServer(moment());
        params += "&q=Timing.repeat/Timing.repeat.bounds/Period.end,beforeEq," +  helper.formatDateForServer(moment().add(1, 'month'));

        return params;
    }

	$scope.parseData = function(questionnaires) {
		var activeAssignedQuestionnaires = [];

		angular.forEach(questionnaires, function(questionnaire) {
			if(activeAssignedQuestionnaires.indexOf(questionnaire) == -1)
				activeAssignedQuestionnaires.push(questionnaire); 
		});

		$scope.mergeData(activeAssignedQuestionnaires);
	}

	$scope.mergeData = function(questionnaires) {
		var questionnaireIds = $.map(questionnaires, function(questionnaire) { return questionnaire.id; });
		$scope.assignedQuestionnaires = $.grep($scope.staticQuestionnaires, function(questionnaire) { return questionnaireIds.indexOf(questionnaire.id) != -1 });
	}

	$scope.setSelectedQuestionnaire = function(questionnaire) {
		$scope.selectedQuestionnaire = questionnaire;
		if(questionnaire)
			$scope.selectedQuestionnaire.answers = [];
	}

	$scope.calculateQuestionnaireScore = function() {
		if(!$scope.selectedQuestionnaire)
			return;

		var score = 0,
		answers = $scope.selectedQuestionnaire.answers;

		for(var i = 0; i < answers.length; i++) {
			var answerScore = parseFloat(answers[i].answer);
			if(isNaN(answerScore)) {
				score = null;
				break;
			} else {
				score += answerScore;
			}
		}

		return score;
	}

	$scope.calculateQuestionGroupScore = function(questionGroupId) {
		if(!$scope.selectedQuestionnaire)
			return;

		var score = 0,
		answers = $.grep($scope.selectedQuestionnaire.answers, function(answer) {  return answer.questionGroupId == questionGroupId; });

		for(var i = 0; i < answers.length; i++) {
			var answerScore = parseFloat(answers[i].answer);
			if(isNaN(answerScore)) {
				score = null;
				break;
			} else {
				score += answerScore;
			}
		}

		return score;
	}

	$scope.getNumberOfQuestions = function() {
		if(!$scope.selectedQuestionnaire)
			return;

		var count = 0;
		angular.forEach($scope.selectedQuestionnaire.questionGroups, function(questionGroup) {
			angular.forEach(questionGroup.questions, function() {
				count++;
			});
		});

		return count;
	}

	$scope.getPostData = function() {
		if(!$scope.selectedQuestionnaire)
			return; 

		var questionnaire = $scope.selectedQuestionnaire,
		    answers = questionnaire.answers;

		return {
			id: questionnaire.id,
			score: $scope.calculateQuestionnaireScore(),
			questionGroups: $.map(questionnaire.questionGroups, function(questionGroup) 
			{
				return {
					id: questionGroup.id,
					score: $scope.calculateQuestionGroupScore(questionGroup.id),
					answers: $.grep(answers, function(answer) { return answer.questionGroupId == questionGroup.id; })
				}
			}
			)
		}
	}

	$scope.postQuestionAnswersForQuestionGroups = function(questionGroups) { 	
		var promises = [];
		angular.forEach(questionGroups, function(qg) {
			promises.push($scope.postQuestionAnswers(qg.answers));
		});

		return $q.all(promises);
	}

	$scope.postQuestionAnswers = function(questionAnswers) {
		var promises = [];
		angular.forEach(questionAnswers, function(questionAnswer) {
			promises.push(questionnairesRepository.postQuestion(questionAnswer.questionId, questionAnswer.answer, $scope.token));
		});

		return $q.all(promises);
	}

	$scope.postQuestionGroupAnswers = function(refs, questionGroups) {
		var promises = [];
		angular.forEach(refs, function(ref, i) {
			var questionAnswers = [];
			angular.forEach(ref, function(qa) {
				questionAnswers.push(qa.headers().location);
				console.log(qa.headers().location, "Question group answer created");
			});

			promises.push(questionnairesRepository.postQuestionGroup(questionGroups[i].id, questionGroups[i].score, questionAnswers, $scope.token));
		});

		return $q.all(promises);
	}

	$scope.postQuestionnaireAnswers = function(refs, questionnaire) {
		var questionGroupAnswers = [];
		angular.forEach(refs, function(ref, i) {
			questionGroupAnswers.push(ref.headers().location);
			console.log(ref.headers().location, "Questionnaire answer created");
		});

		return questionnairesRepository.postQuestionnaire($scope.patientId, questionnaire.id, questionnaire.score, questionGroupAnswers, $scope.token);
	}

    $scope.afterSubmit = function() {
    	var index = $scope.assignedQuestionnaires.indexOf($scope.selectedQuestionnaire);	
		$scope.assignedQuestionnaires.splice(index, 1);
		
		if($scope.assignedQuestionnaires[index-1])
			$scope.setSelectedQuestionnaire($scope.assignedQuestionnaires[index-1]);
		else if($scope.assignedQuestionnaires[index])
			$scope.setSelectedQuestionnaire($scope.assignedQuestionnaires[index]);
		else 
			$scope.setSelectedQuestionnaire(null);
    }
 
	$scope.submit = function() {
		if(!$scope.selectedQuestionnaire)
			return;
		if(!$scope.patientId) {
			helper.notify('No patient ID defined!', 'warning');
			return;
		}

		var answers = $scope.selectedQuestionnaire.answers;
		if(answers.length != $scope.getNumberOfQuestions()) {
			helper.notify('Please give answers to all the questions!', 'warning');
			return;
		}

		$scope.loading = true;
		var postData = $scope.getPostData();

		return $scope.postQuestionAnswersForQuestionGroups(postData.questionGroups)
		.then(function(response) {
			return $scope.postQuestionGroupAnswers(response, postData.questionGroups);
		})
		.then(function(response) {
			return $scope.postQuestionnaireAnswers(response, postData);
		})
		.then(function(response) {
			$scope.loading = false;
			helper.notify('Questionnaire submitted successfully', 'success');
			$scope.afterSubmit();
		});
	}

	$scope.refresh = function() {
		$scope.getAllQuestionnaires();
	}

	$scope.getAllQuestionnaires = function() {
		$scope.loading = true;
		
		return $q.all([$scope.getAllStaticQuestionnaires(), $scope.getAllAssignedQuestionnaires()])
		.then(function() {
			$scope.loading = false;
		});
	}

    $scope.getAllQuestionnaires();
});
