app.factory('diaryRepository', function($base64, $http, $q) {
	var DiaryRepository = {},
	baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

    DiaryRepository.getQuestionnaireDiaryEntries = function(username, password, patientId) {
    	var url =  baseUrl + 'Patient/' + patientId + '/QuestionnaireOrder';
		var encodedCred = $base64.encode(username + ':' + password);
		return $http({
			url: url,
			method: 'GET',
			headers: {
				'Authorization' : 'Basic ' + encodedCred,
				'Accept' : 'text/turtle',
				'Content-Type' : 'text/turtle'
			}
		});
    }

    DiaryRepository.decodeQuestionnaireDiaryEntries = function(data, patientId) {
    	var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/QuestionnaireOrder";
    	var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    	var parser = N3.Parser();
        var N3Util = N3.Util;
        var diaryQuestionnaireRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    diaryQuestionnaireRefs.push(triple.object);
                } 
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(diaryQuestionnaireRefs);
            }
        });
		
		return defer.promise;
    }

    DiaryRepository.getQuestionnaireDiaryEntryByRef = function(username, password, url) {
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

    DiaryRepository.decodeQuestionnaireDiaryEntry = function(data) {
    	var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var questionnaireDiaryObj = {
        	eventDates: []
        };
        var defer = $q.defer();
        var isFirst = true;

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                     /*console.log("triple has been found: ");
                     console.log("Subject: ", triple.subject, '.',"Blank? ", N3Util.isBlank(triple.subject),
                            "IRI? ", N3Util.isIRI(triple.subject),"Literal? ", N3Util.isLiteral(triple.subject));
                     console.log("Predicate: ", triple.predicate);
                     console.log("Object", triple.object, '.',"Blank? ", N3Util.isBlank(triple.object),
                            "IRI? ", N3Util.isIRI(triple.object),"Literal? ", N3Util.isLiteral(triple.object));
                     console.log("*****************************************************************");*/

                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                        	if(!isFirst)
                        		questionnaireDiaryObj.eventDates.push(N3Util.getLiteralValue(triple.object));
        	                isFirst = false;
                        }
                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                        questionnaireDiaryObj.title = triple.object.split('#')[1].split('_')[1];
                        return;
                    }

                }else if (error) {
                // Check for errors here and possibly reject the promise 
                }else {
                    defer.resolve(questionnaireDiaryObj);
                }
            });

        return defer.promise;
    }

    DiaryRepository.getDevices = function(username, password, patientId) {
        var url =  baseUrl + 'Patient/' + patientId + '/PortableBiomedicalSensorDevice';
        var encodedCred = $base64.encode(username + ':' + password);
        return $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    DiaryRepository.decodeDevices  = function(data, patientId) {
        var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/PortableBiomedicalSensorDevice";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var deviceRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    deviceRefs.push(triple.object);
                } 
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(deviceRefs);
            }
        });
        
        return defer.promise;
    }

    DiaryRepository.getDeviceByRef = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url + "/DeviceUseRequest",
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    DiaryRepository.decodeDeviceEntry = function(data) {
        var partSubject = "http://aerospace.med.auth.gr:8080/welcome/api/data/PortableBiomedicalSensorDevice/";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var deviceEntryRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {              
                if (!N3.Util.isBlank(triple.subject) && triple.subject.indexOf(partSubject) != -1 && triple.subject.indexOf("/DeviceUseRequest") != -1 && triple.predicate != predicate) {
                     deviceEntryRefs.push(triple.object);
                }
            }else if (error) {
            // Check for errors here and possibly reject the promise
            } else {
                    // When the function execution reaches this, it signals that all triples are successfully parsed
                    // and you can resolve the promise here/
                    defer.resolve(deviceEntryRefs);
            }
        });
        
        return defer.promise;
    }


    DiaryRepository.getDeviceDiaryEntryByRef = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url + "?depth=2&version=v2",
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    DiaryRepository.decodeDeviceDiaryEntry = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var deviceDiaryObj = {
            eventDates: []
        };
        var defer = $q.defer();
        var isFirst = true;

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            if(!isFirst)
                               deviceDiaryObj.eventDates.push(N3Util.getLiteralValue(triple.object));
                            isFirst = false;
                        }
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#string") {
                            deviceDiaryObj.title = N3Util.getLiteralValue(triple.object);
                        }
                    }
                }else if (error) {
                // Check for errors here and possibly reject the promise 
                }else {
                    defer.resolve(deviceDiaryObj);
                }
            });

        return defer.promise;
    }


    return DiaryRepository;
});