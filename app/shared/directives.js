app.directive("dropdown", function($timeout) {
		return {
		    restrict: "A",
		    link: function(scope, elem, attrs) {
		        $timeout(function() {
		            $(elem).select2({
                        theme: "bootstrap",
                        minimumResultsForSearch: Infinity
                    });
		        });
		    }
		}
	})
	.directive("animate", function() {
		return {
		    restrict: "A",
		    link: function(scope, elem, attrs) {
		        var duration = attrs["animate"] * 1000;
		        $(elem).fadeIn(duration);
		    }
	    }
	})
	.directive("educationlink",function() {
	return {
		    restrict: "A",
		    link: function(scope, elem, attrs) {
		        $(elem).click(function(e) {
		            e.stopImmediatePropagation();

		            function goToExternal(){
		                window.open(scope.content.content);
		            }

		            var buttons = [
			            {text: 'Go back', style: 'default', close: true},
			            {text: 'Go to external page', style: 'primary', close: true, click: goToExternal }
		            ];

		            var params = {
		                buttons: buttons,
		                url: scope.content.content
		            };

		            eModal.iframe(params, scope.content.description);
		        });
		    }
	    }
	})
	.directive('body', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			    scope.$on('body:class:add', function(e, name) {
			        element.addClass(name);
			        element.find(".canvas").css("display", "none");
			    });
			    scope.$on('body:class:remove', function(e, name) {
			        element.removeClass(name);
			        element.find(".canvas").css("display", "block");
			    });
			}
		}
	})
	.directive('questionAnswer', function() {
	return {
		restrict: "A",
		link: function(scope, elem, attrs) {
		    elem.change(function() {
		        var value = $(this).val(),
		        questionType = $(this).data('questionType'),
		        questionGroupId = $(this).data('questionGroupId'),
		        questionId = $(this).data('questionId'),
		        questionnaire = scope.selectedQuestionnaire;

		        var index = $.map(questionnaire.answers, function(answer) { return answer.questionId; }).indexOf(questionId); 
		        if(index != -1) {
		           questionnaire.answers.splice(index, 1);
		        }
		       
			    if(value) {
			    	var answer = null,
			    	    patt = /^[+-]?\d+(\.\d+)?$/;

                    if(value.indexOf("#") != -1)
			    		answer = value.split("#")[1]; 
			    	else if(patt.test(value))
			    		answer = parseFloat(value);
			    	else 
			    		answer = value;

			        questionnaire.answers.push({ questionGroupId: questionGroupId, questionId: questionId, answer: answer });
			    }
		   });
		}
	}
});