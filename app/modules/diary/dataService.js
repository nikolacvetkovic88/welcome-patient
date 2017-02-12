app.factory('diaryRepository', function($http, $q, helper) {
	var DiaryRepository = {};

    DiaryRepository.getDevices = function(patientId, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/PortableBiomedicalSensorDevice'; 

        return helper.getCloudData(url, token);
    }

    DiaryRepository.decodeDevices  = function(data, patientId) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/PortableBiomedicalSensorDevice";
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

    DiaryRepository.getDeviceByRef = function(url, queryParams, token) {
        url += '/DeviceUseRequest';
        if(queryParams)
        	url += queryParams;

        return helper.getCloudData(url, token);
    }

    DiaryRepository.decodeDevice = function(data) {
        var partSubject = "https://cloud-welcome-project.eu/api/data/PortableBiomedicalSensorDevice/";
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

    DiaryRepository.getDeviceRequestByRef  = function(url, token) {
        return helper.getCloudData(url + "?depth=2&version=v2", token);
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

                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf("DeviceUseRequest") != -1) {
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

                    if(N3Util.isBlank(triple.object) && triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.event") {
                        if(deviceRequestObj.timingEvents == null || deviceRequestObj.timingEvents.length == 0) {
                            deviceRequestObj.timingEvents = [];
                        }

                        deviceRequestObj.timingEvents.push(getItemPerSubject(dates, triple.object));
                        return;
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.durationUnits" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.durationUnits") {
                            deviceRequestObj.durationUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.periodUnits") {
                            deviceRequestObj.periodUnit = getItemPerSubject(stringValues, triple.object);
                            return;
                        }
                    }

                    if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#DeviceUseRequest.notes") {
                        deviceRequestObj.note = getItemPerSubject(stringValues, triple.object);
                        return;
                    }
              
                    if(N3Util.isIRI(triple.object) && triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#device") {
                        var deviceArray = triple.object.split('/');
                        deviceRequestObj.device = deviceArray[deviceArray.length-1];
                        return;
                    }

                    if(N3Util.isBlank(triple.object) && N3Util.isBlank(triple.subject) &&
                        (triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.duration" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency" ||
                        triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period")) {

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.duration") {
                            deviceRequestObj.duration = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.frequency") {
                            deviceRequestObj.frequency = getItemPerSubject(numbers, triple.object);
                            return;
                        }

                        if(triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#Timing.repeat.period") {
                            deviceRequestObj.period = getItemPerSubject(numbers, triple.object);
                            return;
                        }
                    }

                    if(N3Util.isBlank(triple.object) && triple.predicate === "http://lomi.med.auth.gr/ontologies/FHIRResources#DeviceUseRequest.orderedOn") {
                        deviceRequestObj.orderedOn = getItemPerSubject(dates, triple.object);
                        return;
                    } 
                    
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
                } else if(error) {
                    console.log(error);
                } else {
                    defer.resolve(deviceRequestObj);
                }
            });

        return defer.promise;
    }

    DiaryRepository.getAppointments = function(patientId, queryParams, token) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/Encounter';

        if(queryParams)
        	url += queryParams;

        return helper.getCloudData(url, token);
    }

    DiaryRepository.decodeAppointments = function(data, patientId) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/Encounter";
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

    DiaryRepository.getAppointmentByRef = function(url, token) {
        return helper.getCloudData(url, token);
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

    DiaryRepository.getHCPByRef = function(cloudRef, token) {
        var url = helper.hubUrl + '/api/doctors/search/' + cloudRef;

        return helper.getHubData(url, token);
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