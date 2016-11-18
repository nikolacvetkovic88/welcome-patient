var QuestionnairesRepository = {},
    questionnairesUrl = "http://aerospace.med.auth.gr:8080/welcome/api/schema/sparql";//"app/modules/testData/questionnaires.json",

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
   
    /*QuestionnairesRepository.getQuestionnaireByRef = function(username, password, url) {
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'GET',
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Content-Type': 'text/plain'
            }
        });
    }*/

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

    QuestionnairesRepository.postQuestionnaire = function (username, password, patientId, answers, questionnaire) {
        var url = baseUrl + 'QuestionnaireAnswers';
        var encodedCred = $base64.encode(username + ':' + password);
        return  $http({
            url: url,
            method: 'POST',
            data: CloudService.populateRegBodyForQuestionnaire(patientId, null, questionnaire),
            headers: {
                'Authorization' : 'Basic ' + encodedCred,
                'Accept' : 'text/turtle',
                'Content-Type' : 'text/turtle'
            }
        });
    }

    QuestionnairesRepository.populateRegBodyForQuestionnaire = function(patientId, score, questionnaire) {
        var currentDate = moment().format('YYYY-MM-DD HH:mm');
        switch(questionnaire) {
            case "mMRC Questionnaire":
                return  '@prefix arg: <http://spinrdf.org/arg#> .' +
                        '@prefix ns10: <http://lomi.med.auth.gr/ontologies/FHIRResources#> .' +
                        '@prefix ns11: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .' +
                        '@prefix ns12: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .' +
                        '@prefix ns3: <http://lomi.med.auth.gr/ontologies/> .' +
                        '@prefix ns7: <http://lomi.med.auth.gr/ontologies/LomiStorageServerSpecificProperties#> .' +
                        '@prefix ns8: <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .' +
                        '@prefix ns9: <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .' +
                        '@prefix owl: <http://www.w3.org/2002/07/owl#> .' +
                        '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .' +
                        '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .' +
                        '@prefix sp: <http://spinrdf.org/sp#> .' +
                        '@prefix spin: <http://spinrdf.org/spin#> .' +
                        '@prefix spl: <http://spinrdf.org/spl#> .' +
                        '@prefix working2: <http://lomi.med.auth.gr/ontologies/working2#> .' +
                        '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .' +

                        'ns10:QuestionnaireAnswers_2' +
                        ' rdf:type ns10:QuestionnaireAnswers ;' +
                        '<http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [' +
                        '   rdf:type ns8:dateTime ;' +
                        '  rdf:value "' + currentDate + '"^^xsd:date ;' +
                        '] ;' +
                        '<http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> ns10:QuestionnaireAnswersStatus_completed ;' +
                        'ns10:author <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        'ns10:questionnaire ns11:Questionnaire_MMRC ;' +
                        'ns10:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        'ns10:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '<http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [' +
                        '   rdf:type ns8:decimal ;' +
                        '  rdf:value "' + score + '"^^xsd:decimal ;' +
                        '] ' +
                        '.';
            case "Your Daily Questionnaire":
                return  '@prefix arg: <http://spinrdf.org/arg#> .' +
                        '@prefix ns10: <http://lomi.med.auth.gr/ontologies/FHIRResources#> .' +
                        '@prefix ns11: <http://lomi.med.auth.gr/ontologies/WELCOME_entities#> .' +
                        '@prefix ns12: <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#> .' +
                        '@prefix ns3: <http://lomi.med.auth.gr/ontologies/> .' +
                        '@prefix ns7: <http://lomi.med.auth.gr/ontologies/LomiStorageServerSpecificProperties#> .' +
                        '@prefix ns8: <http://lomi.med.auth.gr/ontologies/FHIRPrimitiveTypes#> .' +
                        '@prefix ns9: <http://lomi.med.auth.gr/ontologies/FHIRComplexTypes#> .' +
                        '@prefix owl: <http://www.w3.org/2002/07/owl#> .' +
                        '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .' +
                        '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .' +
                        '@prefix sp: <http://spinrdf.org/sp#> .' +
                        '@prefix spin: <http://spinrdf.org/spin#> .' +
                        '@prefix spl: <http://spinrdf.org/spl#> .' +
                        '@prefix working2: <http://lomi.med.auth.gr/ontologies/working2#> .' +
                        '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .' +

                        'ns10:QuestionnaireAnswers_3' +
                        '  rdf:type ns10:QuestionnaireAnswers ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.authored> [' +
                        '      rdf:type ns8:dateTime ;' +
                        '      rdf:value "' + currentDate + '"^^xsd:date ;' +
                        '    ] ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResources#QuestionnaireAnswers.status> ns10:QuestionnaireAnswersStatus_completed ;' +
                        '  ns10:author <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  ns10:questionnaire ns11:Questionnaire_DSQ_3 ;' +
                        '  ns10:source <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  ns10:subject <http://aerospace.med.auth.gr:8080/welcome/api/data/Patient/' + patientId + '> ;' +
                        '  <http://lomi.med.auth.gr/ontologies/FHIRResourcesExtensions#QuestionnaireAnswers.score> [' +
                        '      rdf:type ns8:decimal ;' +
                        '      rdf:value "' + score + '"^^xsd:decimal ;' +
                        '    ] ;' +
                        '.';
            default:
                break;
        }
    }


        /*var  questionnairesUrl = "http://aerospace.med.auth.gr:8080/welcome/api/schema/sparql";
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
    }*/