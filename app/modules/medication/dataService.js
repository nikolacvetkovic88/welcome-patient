app.factory('medicationRepository', function($base64, $http) {
var MedicationRepository = {},
    baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

MedicationRepository.getMedications = function(username, password, patientId) {
        /*var getMedicationPrescriptionData = function(url) {
            return  $http({
                url: url,
                method: 'GET',
                headers: {
                    'Authorization' : 'Basic ' + encodedCred,
                    'Accept' : 'text/turtle',
                    'Content-Type' : 'text/turtle'
                }
            })
            .success(function(data) {
                console.log(data);
            })
            .error(function() {
                $scope.loading = false;
                bootbox.alert("<div class='text-danger'>Error while getting medications. If this continues please contact support.</div>");
            });
        }*/

        var url =  baseUrl + 'Patient/' + patientId + '/MedicationPrescription';//'http://aerospace.med.auth.gr:8080/welcome/api/data/MedicationPrescription/99425607-9d7a-497f-aeda-c7a3e866d381';
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        })
        .success(function(data) {
            console.log(data);

            var parser = N3.Parser();
            var N3Util = N3.Util;
            parser.parse(data, function(error, triple) {
                if (triple) {
                    if (N3Util.isLiteral(triple.object)) {
                        console.log(triple.predicate); 
                        console.log(triple.subject);
                    }
                }
            });
        });
    };

    return MedicationRepository;
});