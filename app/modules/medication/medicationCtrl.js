app.controller('medicationCtrl', function($scope, $rootScope, medicationRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.loading = true;
	$scope.medications = null;
	$scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;

	$scope.getMedications = function() {
		medicationRepository.getMedications('welk','welk', $scope.patientId)
		.success(function(data) {
			$scope.loading = false;
		})
		.error(function() {
            $scope.loading = false;
            bootbox.alert("<div class='text-danger'>Error while getting medications. If this continues please contact support.</div>");
        });
	}

	$scope.getMedications();   
});