app.controller('homeCtrl', function($scope, $rootScope) {
	$scope.$emit('body:class:remove', "transparent");

	$scope.moduleVisible = function(name) {
		return $rootScope.patient && $.map($rootScope.patient.patientModules, function(module) { return module.moduleDescription; }).indexOf(name) != -1;
	}
});