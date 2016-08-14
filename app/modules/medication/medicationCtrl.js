app.controller('medicationCtrl', function($scope, $rootScope, $q, medicationRepository) {
	$scope.$emit('body:class:add', "transparent");
	$scope.patientId = $rootScope.Patient ? $rootScope.Patient.cloudRef : null;

	$scope.getMedications = function() {
		/*medicationRepository.getMedicationPrescriptions('welk','welk', $scope.patientId)
		.success(function(data) {
			$scope.medications = medicationRepository.decodeMedicationPrescriptions('welk', 'welk', $scope.patientId, data);
			$scope.loading = false;
		})
		.error(function() {
            $scope.loading = false;
            bootbox.alert("<div class='text-danger'>Error while getting medications. If this continues please contact support.</div>");
        });*/
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
        	console.log(medications);
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

	$scope.getAllMedications = function(medications) {
		var promises = [];
        angular.forEach(medications, function(medication) {
            promises.push(medicationRepository.decodeMedication(medication.data));
        });

        return $q.all(promises);
	}

	$scope.getMedications();   
});