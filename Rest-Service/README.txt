rest api gebruik voor gateway:

registratie gateway:
1. De eerste keer dat er een nieuwe gateway wordt opgezet eenmalig registreren:
    POST Request: 
		URL	: server:8081/apiV1/registergateway
		BODY    : 
			token       : hVMwoWjpX7hVEjinjxhQ  //altijd hetzelfde
            		username    : gebruikersnaam        //gebruikersnaam waarmee ingelogd kan worden
            		password    : wachtwoord            //wachtwoord waarmee ingelogd kan worden
            		gatewayname : gatewaynaam           //naam voor de gateway (voor inzien gegevens)


Versturen data:
Nu hoeft er alleen nog maar geauthenticeerd te worden om data te sturen
1. Authenticatie:
    POST Request:
        URL     : server:8081/apiV1/authenticate
        BODY    : 
            username    : gebruikersnaam        //ingegeven bij registratie
            password    : wachtwoord            //ingegeven bij registratie
    Bij een authenticatie wordt er een token die 1 uur geldig is teruggegeven

2. Metingen opslaan:
    POST Request:
        URL     : server:8081/apiV1/addmeasurement
        BODY    : 
            token       : token                 //token teruggekregen bij authenticatie
            measurement: {                     //data uitgelezen, vergeet de " niet
                "cputemp":50,                    
                "casetemp":21,
                "humidity":70
                }
