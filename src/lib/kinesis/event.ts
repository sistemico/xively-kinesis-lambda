//
// Kinesis event
//

type KinesisEvent = {
  Records: KinesisRecord[];
};

type KinesisRecord = {
  eventID: string,
  eventVersion: string,
  kinesis: {
    partitionKey: string,
    data: string,
    kinesisSchemaVersion: string,
    sequenceNumber: string,
    approximateArrivalTimestamp: number;
  },
  invokeIdentityArn: string,
  eventName: string,
  eventSourceARN: string,
  eventSource: string,
  awsRegion: string,
};
