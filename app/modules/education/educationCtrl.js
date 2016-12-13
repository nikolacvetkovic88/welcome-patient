app.controller('educationCtrl', function($scope, $rootScope, $sce, $q, educationRepository) {
  $scope.$emit('body:class:add', "transparent");
  $scope.patientId = $rootScope.patient ? $rootScope.patient.cloudRef : null;
  
  $scope.getEducationMaterial = function() {
    $scope.loading = true;

    educationRepository.getEducationMaterial('welk', 'welk', $scope.patientId)
    .then(function(response) {
        return educationRepository.decodeEducationMaterial(response.data, $scope.patientId);
      })
      .then(function(educationMaterialRefs) {
        return $scope.getEducationMaterialUriPromises(educationMaterialRefs);
      })
      .then(function(educationMaterial) {
        return $scope.getAllEducationContent(educationMaterial);
      })
      .then(function(educationContents) {
        $scope.parseData(educationContents);
        $scope.loading = false;
      });
    }

  $scope.refresh = function() {
    $scope.getEducationMaterial();
  }

  $scope.getEducationMaterialUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
      promises.push(educationRepository.getEducationContentByRef('welk', 'welk', ref));
    });

    return $q.all(promises);
  }

  $scope.getAllEducationContent = function(educationMaterial) {
        var promises = [];
        angular.forEach(educationMaterial, function(educationContent) {
            promises.push(educationRepository.decodeEducationContent(educationContent.data));
        });

        return $q.all(promises);
  }

  $scope.parseData = function(educationMaterial) {
    var programs = [];
    angular.forEach(educationMaterial, function(material) {
      angular.forEach(material.programs, function(program) {
        programs.push(program.replace("PhaProgram", "").replace(/_/g, " ").replace(/"/g, ""));
      });
    });

    $scope.programs = programs;
  }
  
  $scope.getEducationMaterial(); 
});