## Didaktik:

 - Wusstet ihr schon X? Wenn ja: Dann Person/Pair vorstellen lassen, was sie schon herausgefunden haben.

## What to explain

### create-url / get-url

Was beim Erstellen des Projektes alles aufgefallen ist, was erklaerenswer waere:

 - IAM Role / Role Assume - wie geht zugriff auf dynamodb?
 - Lambda / ZIP (ggf. mal haendisch erstellen?)
 - CloudFormation, welches erstellt wird
 - oh nein, es packetiert ja viel zu viel!
 - mein lokales python ist aber ein anderes
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
 - why timeouts? -> change timeout in serverlsss.yml get-url -> increase it to
   60 so that we can see what times out
 - the timeout is actually a protection again "amok" functions
```
An error occurred (ProvisionedThroughputExceededException) when calling the GetItem operation (reached max retries: 9): The level of configured provisioned throughput for the table was exceeded. Consider increasing your provisioning level with the UpdateTable API.: ProvisionedThroughputExceededException
```
 - Ok, what's provisioned thoughput?
 - Show Autoscaling
 - Let it scale until no errors

### Scraper bauen

 - DynamoDB Streams (Bonus: oder sie erstmal einfach drauf loslassen bauen mit synchronem call, dann zeigen, dass das ggf. hart gekoppelt nicht so gut skaliert.)
 - GetAtt erklaeren
 - wie komme ich an die event struktur? `serverless logs` zeigen
 - wo speicher ich das result des previews? in dynamodb oder in s3?
 - dynamodb.putItem ist idempotent damit auch die create-url
 - handler jetzt mal aufsplitten?

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
 
### Hinweise:

 -  Docker-in-Docker ueberfluessig, man kann jetzt auch dockerizePip rauswerfen
 - CodeBuild braucht viele Rechte jetzt. Hier das neue IAM Geloet ausprobieren?

## Referenzen:

- https://github.com/bracki/url-shortener/blob/master/create-url/main.go
