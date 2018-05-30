## Referenzen:

 - https://github.com/bracki/url-shortener/blob/master/create-url/main.go

## What to explain

Was beim Erstellen des Projektes alles aufgefallen ist, was erklaerenswer waere:

 - IAM Role / Role Assume - wie geht zugriff auf dynamodb?
 - Lambda / ZIP (ggf. mal haendisch erstellen?)
 - CloudFormation, welches erstellt wird
 - oh nein, es packetiert ja viel zu viel!
 - mein lokales python ist aber ein anderes
 - regionen
 - serverless local invoke
 ```
 serverless invoke local -f create-url 
 ```
 - Cloud9 IDE Integration zeigen.

### Didaktik:

 - Wusstet ihr schon X? Wenn ja: Dann Person/Pair vorstellen lassen, was sie schon herausgefunden haben.

### Scalability Course

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
