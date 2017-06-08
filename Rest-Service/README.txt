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

User aanmaken:
1. registreren:
om een gebruiker aan te maken moeten de volgende api call gemaakt worden:
    POST Request:
        URL     : server:8081/apiV1/registeruser
        BODY    : 
            token   : "hVMwoWjpX7hVEjinjxhQ"
            username: gebruikersnaam        //zelf verzinnen
            password: wachtwoord            //zelf verzinnen
    wanneer dit succesvol gedaan is, zal er een succes response terugkomen en kan er geauthenticeerd worden

2. authenticatie / inloggen
eerst moet er een token opgehaald worden:
    POST Request:
        URL     : server:8081/apiV1/authenticate
        BODY    : 
            username    : gebruikersnaam
            password    : wachtwoord
Wanneer de gebruikersnaam en wachtwoord goed zijn, wordt er in de response een token teruggegeven

3. Gateway aan account toevoegen
Aan elke gebruiker kunnen gateways toegevoegd worden die ingezien kunnen worden. Standaard kan een gebruiker in 0 gateways kijken.
Om een gateway aan een account toe te voegen, moet de volgende request gedaan worden:
    POST Request:
        URL     : server:8081/apiV1/addgatewaytouser
        BODY    : 
            username    : gebruikersnaam van de gateway
            password    : wachtwoord van de gateway
            token       : meegekregen token, gekregen bij authenticatie
In de response staat of de gateway succesvol aan de gebruiker is gekoppeld

4. Namen beschikbare gateways binnenhalen
Om een lijstje te krijgen met gateways die ingezien kunnen worden, moet de volgende request verstuurd worden:
    POST Request:
        URL     : server:8081/apiV1/listgateways
        BODY    : 
            token       : token verkregen bij authenticatie
De response zal dan in een volgendem manier gegeven worden:
    {
        "gateways": [
            {
                "_id": "593902a83c40011d38de1f8b",
                "HardwareId": 0,
                "HardwareName": "schoolgateway",
                "__v": 0
            }
        ]
    }

5. Laatste meting gateway
Om de laatste meting van een gateway op te halen, moet de volgende request verstuurd worden:
    POST Request:
        URL     : server:8081/apiV1/lastMeasurement
        BODY    :
            token       : token
            gatewayId  : HardwareId
