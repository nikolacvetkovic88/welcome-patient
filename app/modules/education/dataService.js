app.factory('educationRepository', function($base64, $http, $q, helper) {
	var EducationRepository = {};

    EducationRepository.getEducationMaterial = function(username, password, patientId) {
		var url =  helper.baseUrl + '/Patient/' + patientId + '/PhaProgramOrder';
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

    EducationRepository.decodeEducationMaterial = function(data, patientId) {
    	var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/PhaProgramOrder";
    	var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    	var parser = N3.Parser();
        var N3Util = N3.Util;
        var educationMaterialRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    educationMaterialRefs.push(triple.object);
                } 
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(educationMaterialRefs);
            }
        });
		
		return defer.promise;
    }

    EducationRepository.getEducationContentByRef = function(username, password, url) {
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

    EducationRepository.decodeEducationContent = function(data) {
    	var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var educationContentObj = {
        	programs: []
        };
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {              
                    if(!N3Util.isBlank(triple.subject) && triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                        educationContentObj.programs.push(triple.object.split('#')[1]);
                        return;
                    }
                }else if (error) {
                // Check for errors here and possibly reject the promise 
                }else {
                    defer.resolve(educationContentObj);
                }
            });

        return defer.promise;
    }

    return EducationRepository;
});