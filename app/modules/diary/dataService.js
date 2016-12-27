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
                console.log(error);
            } else {
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
        var dates = [];
        var questionnaireDiaryObj = {
        	eventDates: []
        };
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                        	dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }
                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                        questionnaireDiaryObj.title = triple.object.split('#')[1].split('_')[1];
                        return;
                    }

                    if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.event" ) {
                        questionnaireDiaryObj.eventDates.push(getDatePerSubject(dates, triple.object));
                        return;
                    }

                } else if (error) {
                    console.log(error);
                } else {
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
                console.log(error);
            } else {
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
                console.log(error);
            } else {
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
        var dates = [];
        var deviceDiaryObj = {
            eventDates: []
        };
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' && N3Util.isLiteral(triple.object) ) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {                     
                            dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }

                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#string") { // check out
                            deviceDiaryObj.title = N3Util.getLiteralValue(triple.object);
                        return;
                    }
                    }

                    if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.event" ) { // check out
                        deviceDiaryObj.eventDates.push(getDatePerSubject(dates, triple.object));
                        return;
                    }

                } else if (error) {
                    console.log(error); 
                } else {
                    deviceDiaryObj.eventDates.splice(0, 1);
                    defer.resolve(deviceDiaryObj);
                }
            });

        return defer.promise;
    }

    DiaryRepository.getAppointmentDiaryEntries = function(username, password, patientId) {
        var url =  baseUrl + 'Patient/' + patientId + '/Encounter';
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

    DiaryRepository.decodeAppointmentDiaryEntries = function(data, patientId) {
        var subject = "http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/" + patientId + "/Encounter";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var diaryAppointmentRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    diaryAppointmentRefs.push(triple.object);
                } 
            } else if (error) {
                console.log(error);
            } else {
                defer.resolve(diaryAppointmentRefs);
            }
        });
        
        return defer.promise;
    }

    DiaryRepository.getAppointmentDiaryEntryByRef = function(username, password, url) {
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

    DiaryRepository.decodeAppointmentDiaryEntry = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var appointmentDiaryObj = {};
        var dates = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {
                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" && N3Util.isLiteral(triple.object)) {
                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }

                        if(N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#string") {
                            appointmentDiaryObj.title = N3Util.getLiteralValue(triple.object);
                        }
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject)) {
                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            appointmentDiaryObj.start = getDatePerSubject(dates, triple.object);
                            return;
                        }
                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            appointmentDiaryObj.end = getDatePerSubject(dates, triple.object);
                            return;
                        }
                    }

                    if(N3Util.isIRI(triple.object)) {
                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Encounter.participant") {
                            appointmentDiaryObj.hcp = triple.object;
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Encounter.status") {
                            appointmentDiaryObj.status = triple.object.split('#')[1].split('_')[1];
                            return;
                        }
                    }
                } else if (error) {
                    console.log(error);
                } else {
                    defer.resolve(appointmentDiaryObj);
                }
            });


        return defer.promise;
    }

    var getDatePerSubject = function(dates, searchValue){
        for(var i = 0; i< dates.length; i++){
            if(dates[i].subject === searchValue) {
                return dates[i].value;
            }
        }
    };

    return DiaryRepository;
});