app.factory('diaryRepository', function($base64, $http, $q, AccountService) {
	var DiaryRepository = {},
	    baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

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

    DiaryRepository.getDeviceByRef = function(username, password, url, start, end) {
        var encodedCred = $base64.encode(username + ':' + password);
        //url += '/DeviceUseRequest?q=Timing.repeat/Timing.repeat.bounds/Period.start,afterEq,' + formatDateForServer(start);
        //if(end)
            //url += '&q=Timing.repeat/Timing.repeat.bounds/Period.end,beforeEq,' + formatDateForServer(end);

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

    DiaryRepository.decodeDevice = function(data) {
        var partSubject = "http://aerospace.med.auth.gr:8080/welcome/api/data/PortableBiomedicalSensorDevice/";
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var deviceRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {              
                if (!N3.Util.isBlank(triple.subject) && triple.subject.indexOf(partSubject) != -1 && triple.subject.indexOf("/DeviceUseRequest") != -1 && triple.predicate != predicate) {
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

    DiaryRepository.getDeviceRequestByRef  = function(username, password, url) {
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

    DiaryRepository.decodeDeviceRequest = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var deviceRequestObj = {};
        var dates = [];
        var stringValues = [];
        var numbers = [];
        var defer = $q.defer();

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

                    if(N3Util.isIRI(triple.subject) && triple.subject.search("DeviceUseRequest") != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        deviceRequestObj.cloudRef = cloudRefArray[cloudRefArray.length-1];
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            deviceRequestObj.periodStart = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            deviceRequestObj.periodEnd = getItemPerSubject(dates, triple.object);
                            return;
                        }
                    }

                    //TO DO
                    /*if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) && 
                        (triple.predicate === CloudCommons.predicateDeviceUseRequestDurationUnit ||
                        triple.predicate === CloudCommons.predicateDeviceUseRequestPeriodUnit )) {

                        if(triple.predicate === CloudCommons.predicateDeviceUseRequestDurationUnit ) {
                            deviceRequestObj.durationUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }

                        if(triple.predicate === CloudCommons.predicateDeviceUseRequestPeriodUnit ) {
                            deviceRequestObj.periodUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }
                    }

                   if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === CloudCommons.predicateDeviceUseRequestDuration ||
                        triple.predicate === CloudCommons.predicateDeviceUseRequestFrequency ||
                        triple.predicate === CloudCommons.predicateDeviceUseRequestPeriod)) {

                        if(triple.predicate === CloudCommons.predicateDeviceUseRequestDuration ) {
                            deviceRequestObj.duration = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === CloudCommons.predicateDeviceUseRequestFrequency ) {
                            deviceRequestObj.frequency = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === CloudCommons.predicateDeviceUseRequestPeriod ) {
                            deviceRequestObj.period = getItemPerSubject(numbers, triple.object);
                            return;
                        }
                    }*/

                    //Parse the device use request dates
                    if (N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#integer" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#int")) {

                        numbers.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#date" ||
                        N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#dateTime")) {

                        dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if (N3Util.isBlank(triple.subject) &&
                        triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                        N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#string")) {

                        stringValues.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                    }

                    if(N3Util.isIRI(triple.object) && triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#device") {
                        var deviceArray = triple.object.split('/');
                        deviceRequestObj.device = deviceArray[deviceArray.length-1];
                        return;
                    }
                } else if(error) {
                    console.log(error);
                } else {
                    defer.resolve(deviceRequestObj);
                }
            });

        return defer.promise;
    }

    DiaryRepository.getAppointments = function(username, password, patientId, start, end) {
        var url =  baseUrl + 'Patient/' + patientId + '/Encounter?q=Period.start,afterEq,' + formatDateForServer(start);
        var encodedCred = $base64.encode(username + ':' + password);
        if(end)
            url += '&q=Period.End,beforeEq,' + formatDateForServer(end);

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

    DiaryRepository.decodeAppointments = function(data, patientId) {
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

    DiaryRepository.getAppointmentByRef = function(username, password, url) {
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

    DiaryRepository.decodeAppointment = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var appointmentObj = {};
        var dates = [];
        var defer = $q.defer();

        parser.parse(data,
            function (error, triple) {
                if (triple) {

                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf("Encounter") != -1) {
                        appointmentObj.cloudRef = triple.subject;
                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.isLiteral(triple.object) && N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime") {
                            dates.push({subject: triple.subject, value: N3Util.getLiteralValue(triple.object)});
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start" || 
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.start") {
                            appointmentObj.periodStart = getItemPerSubject(dates, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Period.end") {
                            appointmentObj.periodEnd = getItemPerSubject(dates, triple.object);
                            return;
                        }

                    }

                    if (N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value" &&
                    N3Util.getLiteralType(triple.object) == "http://www.w3.org/2001/XMLSchema#string") {
                        appointmentObj.comment = N3Util.getLiteralValue(triple.object);
                    }

                    if(N3Util.isIRI(triple.object)) {
                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Encounter.participant") {
                            var hcpRefs = triple.object.split('/');
                            appointmentObj.hcpRef = hcpRefs[hcpRefs.length - 1];
                            return;
                        }

                        if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#Encounter.status") {
                            appointmentObj.status = triple.object.split('#')[1].split('_')[1]
                            return;
                        }
                    }
                } else if (error) {
                    console.log(error);
                } else {
                    defer.resolve(appointmentObj);
                }
            });


        return defer.promise;
    }

    DiaryRepository.getHCPByRef = function(cloudRef) {
        var token = AccountService.getToken();
        var url = 'http://welcome-test.exodussa.com/api/doctors/search/' + cloudRef;

        return $http.get(url, {
            headers: {
                "Authorization": "Bearer" + token
            }
        });
    }

    var getItemPerSubject = function(items, searchValue){
        for(var i = 0; i < items.length; i++){
            if(items[i].subject === searchValue) {
                return items[i].value;
            }
        }
    };

    return DiaryRepository;
});