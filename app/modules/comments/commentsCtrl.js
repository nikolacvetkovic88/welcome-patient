app.controller('commentsCtrl', function($scope, $rootScope, $q, commentsRepository, helper, AccountService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
	$scope.hcps = $rootScope.patient ? $rootScope.patient.doctors : [];
	$scope.hcp = null;
	$scope.type = "current";
	$scope.message = null;
	$scope.messages = [];
	$scope.myself = "Me";
	$scope.token = AccountService.getToken();

    $scope.loadMessages = function() {
    	if(!$scope.hcp) {
    		helper.notify('Please select HCP', 'warning'); 
    		return;
    	}

    	$scope.loading = true;	
		return commentsRepository.getMessages($scope.patientId, $scope.getQueryParams(), $scope.token)
		.then(function(response) {
			$scope.total = response.headers('X-Total-Count');
			return commentsRepository.decodeMessages(response.data, $scope.patientId);
		})
		.then(function(messageRefs) {
			return $scope.getMessageUriPromises(messageRefs);
		})
		.then(function(messages) {
			return $scope.getMessages(messages);
		}).then(function(results) {
			var messages = $scope.messages;
			$scope.messages = $scope.sortData(messages.concat($scope.parseData(results)), false);
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

	$scope.parseData = function(data){
		var parsedData = [];
		angular.forEach(data, function(datum) {
			var parsedObject = {};
			parsedObject.subject = datum.subject;
			parsedObject.message = datum.message;
			parsedObject.dateSent = helper.formatDateTimeForUser(datum.dateSent);
			parsedObject.sender = $scope.getSender(datum.sender);
			parsedData.push(parsedObject);
		});

		return parsedData;
	}

	$scope.sortData = function(data, asc) {
        if (asc)
            return data.sort(function (a, b) {
                return new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime()
            });
        else
            return data.sort(function (a, b) {
                return new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime()
            });
    };

	$scope.getSender = function(senderRef) {
		if(senderRef.indexOf("Patient") == -1) {
			var hcpRef = senderRef.split("/");
			hcpRef = hcpRef[hcpRef.length - 1];

			var sender = $.grep($scope.hcps, function(hcp) { return hcp.cloudRef == hcpRef; })[0];

			return sender ? sender.specialty + " " + sender.firstName + " " + sender.lastName : "Unknown HCP";
	    } else {
	    	return $scope.myself;
	    }
	}

	$scope.getQueryParams = function() {
		var params = "?q=res,like," + $scope.hcp.cloudRef + "&q=res,like," + $scope.patientId;
        params += "&Communication.sent,after,1970,desc";

        return params;
	}

	$scope.setType = function(type) {
		$scope.message = null;
		$scope.type = type;
	}

	$scope.postMessage= function() {
		if(!$scope.message) {
			helper.notify('Please type your comment', 'warning'); 
			return;
		} 
		if(!$scope.hcp) {
    		helper.notify('Please select HCP', 'warning'); 
    		return;
    	}

		helper.notify('Your comment has been submitted successfully!', 'success');
		$scope.type = "current";
		$scope.getComments();
	}

	$scope.refresh = function() {
		$scope.message = null;
		$scope.messages.length = 0;
		$scope.loadMessages();
	}

});