app.controller('educationCtrl', function($scope, $sce, educationRepository) {
  $scope.$emit('body:class:add', "transparent");
  $scope.loading = true;

  educationRepository.getAllEducationTopics()
  .success(function(data) {
    $scope.topics = data.topics;
    if($scope.topics && $scope.topics[0].subTopics && $scope.topics[0].subTopics[0])
      $scope.selectedSubTopic = $scope.topics[0].subTopics[0];
      $scope.loading = false;
    })
  .error(function() {
    $scope.loading = false;
    bootbox.alert("<div class='text-danger'>Failed loading education material</div>");
    });

  $scope.setSelectedSubTopic = function(subTopic) {
    $scope.selectedSubTopic = subTopic;
  }

  $scope.collapse = function(index) {
  	return index == 0 ? "collapse in" : "collapse out";
  }
  
});