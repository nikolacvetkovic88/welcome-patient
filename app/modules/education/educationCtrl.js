app.controller('educationCtrl', function($scope, $rootScope, $sce, $q, educationRepository, helper, AccountService) {
  $scope.$emit('body:class:add', "transparent");
  $scope.educationMaterial = [];
  $scope.offset = 0;
  $scope.limit = 20;
  $scope.hcps = $rootScope.patient ? $rootScope.patient.doctors : [];
  $scope.hcp = $scope.hcps ? $scope.hcps[0] : null;
  $scope.token = AccountService.getToken();
  
  $scope.loadEducationMaterial = function() {
    if(!$scope.hcp) {
        helper.notify('Please select HCP', 'warning'); 
        return;
      }

    $scope.loading = true;  
    return educationRepository.getEducationMaterial($scope.patientId, $scope.getQueryParams(), $scope.token)
    .then(function(response) {
      $scope.total = parseInt(response.headers('X-Total-Count'));
      return educationRepository.decodeAllEducationMaterial(response.data, $scope.patientId);
    })
    .then(function(educationMaterialRefs) {
      return $scope.getEducationMaterialUriPromises(educationMaterialRefs);
    })
    .then(function(educationMaterial) {
      return $scope.getEducationMaterial(educationMaterial);
    })
    .then(function(results) {
      $scope.messages = $scope.parseData(results);
      $scope.offset += $scope.limit;
      $scope.loading = false;
    });
  }

  $scope.getEducationMaterialUriPromises = function(refs) {
    var promises = [];
    angular.forEach(refs, function(ref) {
      promises.push(educationRepository.getEducationMaterialByRef(ref, $scope.token));
    });

    return $q.all(promises);
  }

  $scope.getEducationMaterial = function(educationMaterial) {
    var promises = [];
    angular.forEach(educationMaterial, function(material) {
      promises.push(educationRepository.decodeEducationMaterial(material.data));
    });

    return $q.all(promises);
  }

  $scope.parseData = function(data) {
    var parsedData = [];
    angular.forEach(data, function(datum) {
      var parsedObject = {};
      parsedObject.program = datum.program;
      parsedObject.title = datum.title;
      parsedObject.url = datum.url;
      parsedObject.dateSent = helper.formatDateTimeForUserWithSeconds(datum.dateSent);
      parsedData.push(parsedObject);
    });

    return parsedData;
  }

  $scope.getSender = function(senderRef) {
    if(senderRef.indexOf("Patient") == -1) {
      var hcpRef = senderRef.split("/");
        hcpRef = hcpRef[hcpRef.length - 1],
        sender = $.grep($scope.hcps, function(hcp) { return hcp.cloudRef == hcpRef; })[0];

      return sender ? sender.specialty + " " + sender.firstName + " " + sender.lastName : "Unknown HCP";
      } else {
        return $scope.myself;
      }
  }

  $scope.getQueryParams = function() {
    return  "?q=res,like," + $scope.hcp.cloudRef + "&q=res,like," + $scope.patientId +
        "&q=Communication.sent,sortOnly,desc" +
        "&offset=" + $scope.offset + "&limit=" + $scope.limit;
  }
  
  $scope.refresh = function() {
    $scope.educationMaterial.length = 0;
    $scope.offset = 0;
    $scope.loadEducationMaterial();
  }

  $scope.$watch('hcp', function(hcp) {
    if(hcp) {
      $scope.refresh();
    } else {
      $scope.educationMaterial.length = 0;
      $scope.offset = 0;
    }
  });

});