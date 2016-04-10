app.controller('medicationCtrl', function($scope, $rootScope, medicationRepository, CloudService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.loading = true;
	$scope.medications = null;
	$scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;

	/*medicationRepository.getAllMedications()
	.success(function(data) {
		$scope.medications = data.medications;
		$scope.loading = false;
	})
	.error(function() {
	    $scope.loading = false;
		bootbox.alert("<div class='text-danger'>Failed loading medications</div>");
	});*/


    /*if(!patientId) {
      bootbox.alert("<div class='text-danger'>No patient ID defined!</div>");
      return;
    }*/

	$scope.getMedications = function() {
		CloudService.getMedications('welk','welk', $scope.patientId)
		.success(function(data) {
			console.log(data);
			$scope.loading = false;
		})
		.error(function() {
            $scope.loading = false;
            bootbox.alert("<div class='text-danger'>Error while getting medications. If this continues please contact support.</div>");
        });
	}

	$scope.getMedications();   
});