app.factory('questionnairesRepository', function($base64, $http, $q) {
var QuestionnairesRepository = {},
    staticQuestionnairesUrl = 'app/modules/questionnaires/staticQuestionnaires.json',
    baseUrl = 'http://aerospace.med.auth.gr:8080/welcome/api/data/';

    QuestionnairesRepository.getAllStaticQuestionnaires =  function() {
        return $http( {
                method: 'GET',
                url: staticQuestionnairesUrl
            });
    }

    QuestionnairesRepository.getAllAssignedQuestionnaires = function(username, password, patientId) {
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

    QuestionnairesRepository.decodeQuestionnaireOrders = function(data, patientId) {
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

    QuestionnairesRepository.getQuestionnaireOrderByRef = function(username, password, url) {
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

    QuestionnairesRepository.decodeQuestionnaireOrder = function(data) {
        var parser = N3.Parser({ format: 'application/turtle' });
        var N3Util = N3.Util;
        var questionnaireObj = {
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
                                questionnaireObj.eventDates.push(N3Util.getLiteralValue(triple.object));
                            isFirst = false;
                        }
                    }

                    if(triple.predicate == "http://lomi.med.auth.gr/ontologies/FHIRResources#detail" && N3.Util.isIRI(triple.object)) {
                        questionnaireObj.title = triple.object.split('#')[1].split('_')[1];
                        return;
                    }

                }else if (error) {
                // Check for errors here and possibly reject the promise 
                }else {
                    defer.resolve(questionnaireObj);
                }
            });

        return defer.promise;
    }




    var  questionnairesUrl = "http://aerospace.med.auth.gr:8080/welcome/api/schema/sparql";
    QuestionnairesRepository.getQuestionnaires = function(username, password) {
        var encodedCred = $base64.encode(username + ':' + password);
        var query = "PREFIX : <http://lomi.med.auth.gr/ontologies/WELCOME#> \
                    PREFIX FHIRResources: <http://lomi.med.auth.gr/ontologies/FHIRResources#> \
                    PREFIX FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> \
                    PREFIX FHIRct: <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> \
                    PREFIX FHIRpt: <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> \
                    PREFIX WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> \
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
                    \
                    SELECT ?questionnaire ?title \
                    WHERE { \
                    BIND ('el' AS ?my_language) . \
                    ?questionnaire a FHIRResources:Questionnaire . \
                    ?questionnaire FHIRResources:Questionnaire.status FHIRResources:QuestionnaireStatus_published . \
                    \
                    OPTIONAL { \
                    ?questionnaire rdfs:label ?label_my . \
                    FILTER langMatches(lang(?label_my),?my_language) . \
                    } . \
                    OPTIONAL { \
                    ?questionnaire rdfs:comment ?comment_my . \
                    FILTER langMatches(lang(?comment_my),?my_language) . \
                    } . \
                    BIND ( COALESCE(?label_my, ?comment_my) AS ?title_my) . \
                    \
                    OPTIONAL { \
                    ?questionnaire rdfs:label ?label_en . \
                    FILTER langMatches(lang(?label_en),'en') . \
                    } . \
                    OPTIONAL { \
                    ?questionnaire rdfs:comment ?comment_en . \
                    FILTER langMatches(lang(?comment_my),'en') . \
                    } . \
                    BIND ( COALESCE(?label_en, ?comment_en) AS ?title_en) . \
                    \
                    OPTIONAL { \
                    ?questionnaire rdfs:commnt ?comment_undef . \
                    FILTER langMatches(lang(?comment_undef),''). \
                    } .\
                    BIND ( COALESCE(?label_undef, ?comment_undef) AS ?title_undef) . \
                    \
                    BIND ( COALESCE(?title_my, ?title_en, ?title_undef, STR(?questionnaire)) AS ?title) . \
                    }";
        var config = {
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Content-Type': 'text/plain',
                'Accept': 'application/sparql-results+json;'
            }
        };

        return $http.post(questionnairesUrl, query, config);
    }

    QuestionnairesRepository.getQuestionnaire = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        var query = "PREFIX : <http://lomi.med.auth.gr/ontologies/WELCOME#> \
                    PREFIX FHIRResources: <http://lomi.med.auth.gr/ontologies/FHIRResources#> \
                    PREFIX FHIRResourcesExtensions: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> \
                    PREFIX FHIRct: <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> \
                    PREFIX FHIRpt: <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> \
                    PREFIX WELCOME_entities: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> \
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
                    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
                    \
                    SELECT \
                    ?questionnaire \
                    ?group_title ?group_gravity \
                    ?question ?question_type ?question_gravity ?question_text \
                    ?option ?option_display ?option_gravity ?option_score \
                    WHERE { \
                    BIND ('en' AS ?my_language) ." +
                    "BIND (<" + url + ">AS ?questionnaire ) \
                    ?questionnaire FHIRResourcesExtensions:questionsGroup ?group . \
                    OPTIONAL { ?group FHIRResourcesExtensions:QuestionsGroup.gravity/rdf:value ?group_gravity . } \
                    ?group FHIRResourcesExtensions:question ?question . \
                    ?question FHIRResourcesExtensions:Question.type ?question_type . \
                    OPTIONAL { ?question FHIRResourcesExtensions:Question.gravity/rdf:value ?question_gravity .} \
                    OPTIONAL {  \
                    ?question FHIRResourcesExtensions:Question.options ?option . \
                    OPTIONAL { ?option FHIRResourcesExtensions:QuestionOption.gravity/rdf:value ?option_gravity .} \
                    OPTIONAL { ?option FHIRResourcesExtensions:QuestionOption.score/rdf:value ?option_score .} \
                    } \
                    \
                    OPTIONAL { \
                    ?group FHIRResourcesExtensions:QuestionsGroup.title/rdf:value ?group_title_my . \
                    FILTER langMatches(lang(?group_title_my),?my_language) . \
                    } . \
                    OPTIONAL { \
                    ?group FHIRResourcesExtensions:QuestionsGroup.title/rdf:value ?group_title_en . \
                    FILTER langMatches(lang(?group_title_en),'en') . \
                    } . \
                    OPTIONAL { \
                    ?group FHIRResourcesExtensions:QuestionsGroup.title/rdf:value ?group_title_undef . \
                    FILTER langMatches(lang(?group_title_undef),'') . \
                    } . \
                    OPTIONAL { \
                    ?group rdfs:label ?group_title_from_label . \
                    } . \
                    BIND ( COALESCE(?group_title_my, ?group_title_en, ?group_title_undef, ?group_title_from_label, STR(?group)) AS ?group_title) . \
                    \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.text/rdf:value ?question_text_my . \
                    FILTER langMatches(lang(?question_text_my),?my_language) . \
                    } \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.text/rdf:value ?question_text_en . \
                    FILTER langMatches(lang(?question_text_en),'en') . \
                    } \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.text/rdf:value ?question_text_undef . \
                    FILTER langMatches(lang(?question_text_undef),'') . \
                    } \
                    OPTIONAL { ?question rdfs:label ?question_text_from_label .}  \
                    BIND ( COALESCE(?question_text_my, ?question_text_en,?question_text_undef, ?question_text_from_label, STR(?question)) AS ?question_text) . \
                    \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.options ?option . \
                    ?option FHIRResources:ValueSet.display/rdf:value ?option_display_my . \
                    FILTER langMatches(lang(?option_display_my), ?my_language) . \
                    } \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.options ?option . \
                    ?option FHIRResources:ValueSet.display/rdf:value ?option_display_en . \
                    FILTER langMatches(lang(?option_display_en),'en') . \
                    } \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.options ?option . \
                    ?option FHIRResources:ValueSet.display/rdf:value ?option_display_undef . \
                    FILTER langMatches(lang( ?option_display_undef),'') . \
                    } \
                    OPTIONAL { \
                    ?question FHIRResourcesExtensions:Question.options ?option . \
                    ?option rdfs:label ?option_display_from_label . \
                    } \
                    BIND ( COALESCE(?option_display_my, ?option_display_en, ?option_display_undef, ?option_display_from_label, STR(?option)) AS ?option_display) . \
                    } ORDER BY ?question_gravity ?option_gravity";

        var config = {
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Content-Type': 'text/plain',
                'Accept': 'application/sparql-results+json;'
            }
        };

        return $http.post(questionnairesUrl, query, config);
    }






   QuestionnairesRepository.decodeQuestionnaires = function(data) {
        var questionnaires = [];
        var defer = $q.defer();

        angular.forEach(data, function(questionnaire) {
            questionnaires.push({
                questionnaireId: questionnaire.title.value, 
                questionnaire: questionnaire.title.value,
                url: questionnaire.questionnaire.value
            });
        });

        defer.resolve(questionnaires);

        return defer.promise;
    }


















    return QuestionnairesRepository;
});