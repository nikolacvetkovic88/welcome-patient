app.factory('medicationRepository', function($base64, $http, $q) {
	var MedicationRepository = {},
	baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

	MedicationRepository.getMedicationPrescriptions= function(username, password, patientId) {
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
		});
    }

    MedicationRepository.getMedicationPrescriptionOrMedicationByRef = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    MedicationRepository.decodeMedicationPrescriptions = function(data, patientId) {
    	var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/MedicationPrescription";
    	var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    	var parser = N3.Parser();
        var N3Util = N3.Util;
        var prescriptionRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    prescriptionRefs.push(triple.object);
                } 
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(prescriptionRefs);
            }
        });
		
		return defer.promise;
    }

    MedicationRepository.decodeMedicationPrescription = function(data) {
    	var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var medicationRefs = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(!N3Util.isBlank(triple.subject) && triple.predicate === 'http://lomi.med.auth.gr/ontologies/FHIRResources#medication') {
                        medicationRefs.push(triple.object);
                    }
					
					/*if(!N3Util.isBlank(triple.subject) && triple.predicate === 'http://lomi.med.auth.gr/ontologies/FHIRResources#patient') {
                        var strArray = triple.object.split('/');
                        medObj.patientUri = strArray[strArray.length-1];
                        return;
                    }*/
                } else if (error) {

                } else {
                    defer.resolve(medicationRefs);
                }
            });

        return defer.promise;
    }

    MedicationRepository.decodeMedication = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var medObj = {};
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {//http://lomi.med.auth.gr/ontologies/FHIRResources#Medication.name
                        medObj.medication = N3Util.getLiteralValue(triple.object);
                    }
                } else {
                    defer.resolve(medObj);
                }
            });

        return defer.promise;
    }

    return MedicationRepository;
});