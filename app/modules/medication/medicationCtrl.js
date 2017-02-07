app.controller('medicationCtrl', function($scope, $rootScope, $q, medicationRepository, AccountService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
    $scope.token = AccountService.getToken();

	$scope.getAllMedications = function() {
        $scope.loading = true;
        
        medicationRepository.getMedications($scope.patientId, moment(), null, $scope.token)
        .then(function(response) {
        	return medicationRepository.decodeMedications(response.data, $scope.patientId);
        })
        .then(function(prescriptionRefs) {
        	return $scope.getMedicationUriPromises(prescriptionRefs);
        })
        .then(function(prescriptions) {
        	return $scope.getMedications(prescriptions);
        })
        .then(function(results) {
        	$scope.medications = results;
        	$scope.loading = false;
        });
	}
    
	$scope.getMedicationUriPromises = function(refs) {	
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(medicationRepository.getMedicationByRef(ref, $scope.token));
        });

        return $q.all(promises);
	}

    $scope.getMedications = function(medications) {
        var promises = [];
        angular.forEach(medications, function(medication) {
            promises.push(medicationRepository.decodeMedication(medication.data));
        });

        return $q.all(promises);
    }

    $scope.refresh = function() {
        $scope.filter = '';
        $scope.getAllMedications();
    }

	$scope.getAllMedications();   
});