app.controller('medicationCtrl', function($scope, $rootScope, $q, medicationRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.patient ? $rootScope.patient.cloudRef : null;

	$scope.getMedications = function() {
        $scope.loading = true;
        
        medicationRepository.getMedicationPrescriptions('welk', 'welk', $scope.patientId)
        .then(function(response) {
        	return medicationRepository.decodeMedicationPrescriptions(response.data, $scope.patientId);
        })
        .then(function(prescriptionRefs) {
        	return $scope.getMedicationPrescriptionOrMedicationUriPromises(prescriptionRefs);
        })
        .then(function(prescriptions) {
        	return $scope.getAllMedicationPrescriptions(prescriptions);
        })
        .then(function(medicationRefs) {
        	return $scope.getMedicationPrescriptionOrMedicationUriPromises(medicationRefs);
        })
        .then(function(medications) {
        	return $scope.getAllMedications(medications);
        })
        .then(function(results) {
        	$scope.medications = results;
        	$scope.loading = false;
        });
	}
    
	$scope.getMedicationPrescriptionOrMedicationUriPromises = function(refs) {	
        var promises = [];
        angular.forEach(refs, function(ref) {
            promises.push(medicationRepository.getMedicationPrescriptionOrMedicationByRef('welk', 'welk', ref));
        });

        return $q.all(promises);
	}

	$scope.getAllMedicationPrescriptions = function(prescriptions) {
		var promises = [];
        angular.forEach(prescriptions, function(prescription) {
            promises.push(medicationRepository.decodeMedicationPrescription(prescription.data));
        });

        return $q.all(promises);
	}

    $scope.refresh = function() {
        $scope.filter = '';
        $scope.getMedications();
    }

	$scope.getAllMedications = function(medications) {
		var promises = [];
        angular.forEach(medications, function(medication) {
            promises.push(medicationRepository.decodeMedication(medication.data));
        });

        return $q.all(promises);
	}

	$scope.getMedications();   
});