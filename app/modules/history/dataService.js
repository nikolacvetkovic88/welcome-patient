app.factory('historyRepository', function($http, $q, helper) {
    var HistoryRepository = {};

    HistoryRepository.getData =  function (patientId, queryParams, token, type) {
        var url =  helper.baseUrl + '/Patient/' + patientId + '/' + type;
        if(queryParams)
            url += queryParams;

        return helper.getCloudData(url, token);
    }; 

    HistoryRepository.decodeData = function(data, patientId, type) {
        var subject = "https://cloud-welcome-project.eu/api/data/Patient/" + patientId + "/" + type;
        var predicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        var parser = N3.Parser();
        var N3Util = N3.Util;
        var dataRefs = [];
        var defer = $q.defer();

        parser.parse(data, function(error, triple) {
            if(triple) {
                if (triple && triple.subject === subject && triple.predicate != predicate) {
                    dataRefs.push(triple.object);
                } 
            }else if (error) {
                console.log(error);
            } else {
                defer.resolve(dataRefs);
            }
        });
        
        return defer.promise;
    }

    HistoryRepository.getDatumByRef = function(url, token) {
        return helper.getCloudData(url, token);
    }

    HistoryRepository.decodeDatum = function(datum, type) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var obj = {};
        var stringValues = [];
        var defer = $q.defer();

        parser.parse(datum,
            function (error, triple) {
                if (triple) {
					console.log("triple has been found: ");
                    console.log("Subject: ", triple.subject, '.',"Blank? ", N3Util.isBlank(triple.subject),
                        "IRI? ", N3Util.isIRI(triple.subject),"Literal? ", N3Util.isLiteral(triple.subject));
                    console.log("Predicate: ", triple.predicate);
                    console.log("Object", triple.object, '.',"Blank? ", N3Util.isBlank(triple.object),
                        "IRI? ", N3Util.isIRI(triple.object),"Literal? ", N3Util.isLiteral(triple.object));
                    console.log("*****************************************************************");


                    if(N3Util.isIRI(triple.subject) && triple.subject.indexOf(type) != -1) {
                        var cloudRefArray = triple.subject.split('/');
                        obj.cloudRef = cloudRefArray[cloudRefArray.length-1];
                    }

                    if(N3Util.isBlank(triple.subject) && triple.predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#value") {
                        if(N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#dateTime" 
                            || N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#date")) {
                            
                            obj.date = N3Util.getLiteralValue(triple.object);
                            return;
                        }

                        if(N3Util.isLiteral(triple.object) && (N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#decimal"
                            || N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#int"
                            || N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#integer")) {
                            
                            obj.value = N3Util.getLiteralValue(triple.object);
                            return;
                        }

                        if(N3Util.isLiteral(triple.object) && N3Util.getLiteralType(triple.object) === "http://www.w3.org/2001/XMLSchema#string") {
                            obj.unit = N3Util.getLiteralValue(triple.object);
                            return;
                        }
                    }
                } else if(error){
                    console.log(error);
                } else {
                    defer.resolve(obj);
                }
            });

        return defer.promise;
    }
     
    return HistoryRepository;
});