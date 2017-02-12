app.controller('commentsCtrl', function($scope, $rootScope, $q, commentsRepository, helper, AccountService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
	$scope.hcps = $scope.patientId.doctors;
	$scope.hcp = null;
	$scope.type = "current";
	$scope.message = null;
	$scope.token = AccountService.getToken();

    $scope.getComments = function() {
    	if(!$scope.hcp)
    		return;

    	$scope.loading = true;	
		return commentsRepository.getMessages($scope.patientId, $scope.getQueryParams(), $scope.token)
		.then(function(response) {
			return commentsRepository.decodeMessages(response.data, $scope.patientId);
		})
		.then(function(messageRefs) {
			return $scope.getMessageUriPromsies(messageRefs);
		})
		.then(function(messages) {
			return $scope.getMessages(messages);
		}).then(function(results) {
			console.log(results);
			$scope.messages = results;
			$scope.loading = false;
		});
	}

	$scope.getMessageUriPromises = function(refs) {
		var promises = [];
		angular.forEach(refs, function(ref) {
			promises.push(commentsRepository.getMessageByRef(ref, $scope.token));
		});

		return $q.all(promises);
	}

	$scope.getMessages = function(messages) {
		var promises = [];
		angular.forEach(messages, function(message) {
			promises.push(commentsRepository.decodeMessage(message.data));
		});

		return $q.all(promises);
	}

	$scope.getQueryParams = function() {
		var params = "?q=res,like," + $scope.hcp;
        params += "&Communication.sent,after,1970,desc";

        return params;
	}

	$scope.parseData = function(data) {
		/*var comments = [];

		angular.forEach(data.todayComments, function(comment, key) {
			comments.push({ dateTime: comment.dateTime, sender: comment.sender, content: comment.content });
		});
		$scope.commentsToday = comments;
		comments = [];

		angular.forEach(data.weekComments, function(comment, key) {
			comments.push({ dateTime: comment.dateTime, sender: comment.sender, content: comment.content });
		});
		$scope.commentsWeek = comments;
		comments = [];

		angular.forEach(data.monthComments, function(comment, key) {
			comments.push({ dateTime: comment.dateTime, sender: comment.sender, content: comment.content });
		});
		$scope.commentsMonth = comments;
		comments = [];*/
	}

	$scope.setType = function(type) {
		$scope.message = null;
		$scope.type = type;
	}

	$scope.postComment = function() {
		if(!$scope.message) {
			helper.notify('Please type your comment', 'warning'); 
			return;
		} else {
			helper.notify('Your comment has been submitted successfully!', 'success');
			$scope.type = "current";
			$scope.getComments();
		}
	}

	$scope.refresh = function() {
		$scope.getComments();
	}

});