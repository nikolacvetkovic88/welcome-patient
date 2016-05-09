app.controller('commentCtrl', function($scope, commentRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.commentsToDisplay = null;

    $scope.loadComments = function() {
    	$scope.loading = true;
		commentRepository.getComments()
		.success(function(data) {
			$scope.loading = false;
			$scope.parseData(data);
			$scope.setContent("today");
		})
		.error(function() {
			$scope.loading = false;
			bootbox.alert("<div class='text-danger'>Failed loading comments.</div>"); 
		});
	}

	$scope.parseData = function(data) {
		var comments = [];

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
		comments = [];
	}

	$scope.setContent = function(mode) {
		$scope.commentType = mode;

		switch  (mode) {
			case  "today":
			    $scope.commentsToDisplay = $scope.commentsToday;
			    break;
			case  "week":
			    $scope.commentsToDisplay = $scope.commentsWeek;
			    break;
			case "month":
			    $scope.commentsToDisplay = $scope.commentsMonth;
			    break;
			case "new":
			    $scope.myComment = "";
			    $scope.commentsToDisplay = null;
			default:
			    break;
		}
	}

	$scope.submitNewComment = function() {
		if(!$scope.myComment || !$scope.myComment.length) {
			bootbox.alert("<div class='text-danger'>Please type your comment!</div>");
			return false;
		} else {
			setTimeout(function() {
				bootbox.alert("<div class='text-info'>Your comment has been submitted successfully!");
				$scope.loadComments();
			}, 1000);
		}
	}

	$scope.loadComments();
});
