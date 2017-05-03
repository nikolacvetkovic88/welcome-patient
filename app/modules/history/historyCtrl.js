app.controller('historyCtrl', function($scope, $rootScope, $q, historyRepository, helper, AccountService) {
    $scope.$emit('body:class:add', "transparent");
    $scope.patientId = $rootScope.patient ? $rootScope.patient.user.cloudRef : null;
    $scope.token = AccountService.getToken();
    $scope.selected = null;
    $scope.selectedData = null;

    $scope.loadBloodPressureData = function() {
        bootbox.alert("blood pressure");
        $scope.selected = 1;
    }

    $scope.loadWeightData = function() {
        bootbox.alert("weight");
        $scope.selected = 2;
    }    

    $scope.loadBloodGlucoseData = function() {
        bootbox.alert("blood glucose");
        $scope.selected = 3;
    }

    $scope.loadTemperatureData = function() {
        bootbox.alert("temperature");
        $scope.selected = 4;
    }

    $scope.loadSpirometerData = function() {
        bootbox.alert("spirometer");
        $scope.selected = 5;
    }

    $scope.loadExacerbationsData = function() {
        bootbox.alert("exacerbations");
        $scope.selected = 6;    
    }

    $scope.loadHospitalAdmissionsData = function() {
        bootbox.alert("hospital admissions");
        $scope.selected = 7;
    }

    $scope.loadCigarettesSmokedData = function() {
        bootbox.alert("cigarettes smoked");
        $scope.selected = 8;
    }

    $scope.loadMedicationAdherenceData = function() {
        bootbox.alert("medication adherence");
        $scope.selected = 9;
    }

    $scope.loadOedemaData = function() {
        bootbox.alert("oedema");
        $scope.selected = 10;
    }

    $scope.loadMoodData = function() {
        bootbox.alert("mood");
        $scope.selected = 11;
    }

    $scope.loadPhysicalActivitiesData = function() {
        bootbox.alert("physical activities");
        $scope.selected = 12;
    }

    $scope.refresh = function() {
        var selected = $scope.selected;

        switch (selected) {
            case 1:
                return $scope.loadBloodPressureData();
            case 2:
                return $scope.loadWeightData();
            case 3:
                return $scope.loadBloodGlucoseData();
            case 4:
                return $scope.loadTemperatureData();
            case 5:
                return $scope.loadSpirometerData();
            case 6:
                return $scope.loadExacerbationsData();
            case 7:
                return $scope.loadHospitalAdmissionsData();
            case 8:
                return $scope.loadCigarettesSmokedData();
            case 9:
                return $scope.loadMedicationAdherenceData();
            case 10:
                return $scope.loadOedemaData();
            case 11:
                return $scope.loadMoodData();
            case 12:
                return $scope.loadPhysicalActivitiesData();
            default:
                break;
        }
        
    }
});