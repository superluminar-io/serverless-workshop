## Didaktik:

 - Wusstet ihr schon X? Wenn ja: Dann Person/Pair vorstellen lassen, was sie schon herausgefunden haben.

## What to explain

### create-url / get-url

Was beim Erstellen des Projektes alles aufgefallen ist, was erklaerenswer waere:

 - IAM Role / Role Assume - wie geht zugriff auf dynamodb?
 - Lambda / ZIP (ggf. mal haendisch erstellen?)
 - CloudFormation, welches erstellt wird
 - oh nein, es packetiert ja viel zu viel!
 - mein lokales python ist aber ein anderes -> https://www.npmjs.com/package/serverless-python-requirements und dockerizePip
 - serverless plugins
 - regionen
 - serverless local invoke
 - create-url: putItem ist idempotent.
 ```
 serverless invoke local -f create-url 
 ```
 - Cloud9 IDE Integration zeigen.

#### Scalability Course

 - Start apache bench with -c 50
 - Look at Lambda invocations, see invocations errors
 - have a look in the logs, see timeouts after default time outs 
 - why timeouts? -> change timeout in serverless.yml get-url -> increase it to
   60 so that we can see what times out
 - the timeout is actually a protection again "amok" functions
```
An error occurred (ProvisionedThroughputExceededException) when calling the GetItem operation (reached max retries: 9): The level of configured provisioned throughput for the table was exceeded. Consider increasing your provisioning level with the UpdateTable API.: ProvisionedThroughputExceededException
```
 - Ok, what's provisioned thoughput?
 - Show Autoscaling/On Demand
 - Enable on-demand

### Scraper bauen

 - DynamoDB Streams (Bonus: oder sie erstmal einfach drauf loslassen bauen mit synchronem call, dann zeigen, dass das ggf. hart gekoppelt nicht so gut skaliert.)
 - GetAtt erklaeren
 - wie komme ich an die event struktur? `serverless logs` zeigen
 - wo speicher ich das result des previews? in dynamodb oder in s3?
 - dynamodb.putItem ist idempotent damit auch die create-url
 - handler jetzt mal aufsplitten?
 - timeout runtersetzen
 - kaputte url reintun 
 - langsame url reintun -> damit ziegen dass lambda auch an ein timeout stossen kann
 - batch size kann man noch erklaeren
 
## Was aendert sich, was bleibt gleich?

### Was aendert sich mit Serverless

Uebung: Den Teilnehmer*innen diese Frage stellen. Auf Karten schreiben.

- Nutzung von Services statt Kauf von Produkten
- Damit schnellere Time to Market
- Groessere Transparenz der Kosten
- Enforcement von 12-factor
- Lieblingstechnologie -> Wissen ueber wann welche Cloud-Bausteine einzusetzen sind
- Spezialist -> Cloud Generalist

### Weiterfuehrende Links


### Was bleibt gleich mit Serverless

Uebung: Den Teilnehmer*innen diese Frage stellen. Auf Karten schreiben.

- Hexagonal architecture, Ports and Adapters
- Test pyramid
- Domain Driven Design
- Design patterns
- CAP theorem
- Fallacies of distributed computing
- (SQL) injection

## Ideen fuer zusaetzliche uebungen, falls Pairs frueher fertig sind.

 - schreibe html nach s3
 - oder counter einbauen in url shortener "get-url"

## Pipeline

 - CodeCommit -> klicken und remote hinzufuegen in git
 - CodePipeline: Klicken und Inline CodeBuild machen
 - CodeBuild: NodeJS runtime mit privileged (fuer dockerizePip). Die Rolle braucht dann noch AdministratorAccess
```
version: 0.2
  build:
    commands:
      - npm i
      - node_modules/.bin/serverless deploy --region $AWS_DEFAULT_REGION

```
 
### Hinweise / weitere Uebungen:

- Docker-in-Docker ueberfluessig, man kann jetzt auch dockerizePip auswerfen
 - CodeBuild hat/braucht viele Rechte jetzt. Weitere Links:
   - https://www.puresec.io/blog/generating-least-privileged-iam-roles-for-aws-lambda-functions-the-easy-way
   - https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_access-advisor.html

## Tracing

1. X-Ray Plugin aktivieren: https://www.npmjs.com/package/serverless-plugin-tracing
2. API GW Tracing aktivieren ueber Hack

## Alerting

Wir verwenden https://github.com/ACloudGuru/serverless-plugin-aws-alerts

 - Default alerts -> einmal triggern mit throttling funktion und apache bench
 - Custom Alert


## Referenzen:

- https://github.com/bracki/url-shortener/blob/master/create-url/main.go
