app.controller('medicationsCtrl', function($scope, $rootScope, $q, medicationsRepository, helper, AccountService) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
    $scope.token = AccountService.getToken();

	$scope.getAllMedications = function() {
        $scope.loading = true;
        
        medicationsRepository.getMedications($scope.patientId, $scope.getQueryParams(), $scope.token)
        .then(function(response) {
        	return medicationsRepository.decodeMedications(response.data, $scope.patientId);
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
            promises.push(medicationsRepository.getMedicationByRef(ref, $scope.token));
        });

        return $q.all(promises);
	}

    $scope.getMedications = function(medications) {
        var promises = [];
        angular.forEach(medications, function(medication) {
            promises.push(medicationsRepository.decodeMedication(medication.data));
        });

        return $q.all(promises);
    }

    $scope.getQueryParams = function() {
        return "?q=MedicationPrescription.dosageInstruction.scheduled/Timing.repeat/Timing.repeat.bounds/Period.end,afterEq," +  helper.formatDateForServer(moment());
    }

    $scope.refresh = function() {
        $scope.filter = '';
        $scope.getAllMedications();
    }

	$scope.getAllMedications();   
});