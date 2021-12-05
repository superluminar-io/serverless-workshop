export const handler = async (event: AWSLambda.EventBridgeEvent<any, any>) => {
  // Just log the event
  console.log(event);
};