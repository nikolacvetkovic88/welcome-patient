app.controller('questionnairesCtrl', function($scope, $rootScope, $q, questionnairesRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.cloudRef : null;

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
		$scope.assignedQuestionnaires = $.grep($scope.staticQuestionnaires, function(questionnaire) { return questionnaires.indexOf(questionnaire.id) != -1; });
	}

	$scope.setSelectedQuestionnaire = function(questionnaire) {
		$scope.selectedQuestionnaire = questionnaire;
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
			promises.push(questionnairesRepository.postQuestion('welk', 'welk', questionAnswer.questionId, questionAnswer.answer));
		});

		return $q.all(promises);
	}

	$scope.postQuestionGroupAnswers = function(refs, questionGroups) {
		var promises = [];
		angular.forEach(refs, function(ref, i) {
			var questionAnswers = [];
			angular.forEach(ref, function(qa) {
				questionAnswers.push(qa.headers().location);
				console.log(qa.headers().location);
			});

			promises.push(questionnairesRepository.postQuestionGroup('welk', 'welk', questionGroups[i].id, questionGroups[i].score, questionAnswers));
		});

		return $q.all(promises);
	}

	$scope.postQuestionnaireAnswers = function(refs, questionnaire) {
		var questionGroupAnswers = [];
		angular.forEach(refs, function(ref, i) {
			questionGroupAnswers.push(ref.headers().location);
			console.log(ref.headers().location);
		});

		return questionnairesRepository.postQuestionnaire('welk', 'welk', $scope.patientId, questionnaire.id, questionnaire.score, questionGroupAnswers);
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
			notify("No patient ID defined!", "warn");
			return;
		}

		var answers = $scope.selectedQuestionnaire.answers;
		if(answers.length != $scope.getNumberOfQuestions()) {
			notify("Please give answers to all the questions!", "warn");
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
			console.log(response.headers().location);
			$scope.loading = false;
			notify("Questionnaire submitted successfully", "success");
			$scope.afterSubmit();
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
