type EventName =
  | 's3:ObjectCreated:Put'
  | 's3:ObjectCreated:CompleteMultipartUpload'
  | 's3:ObjectAccessed:Head'
  | 's3:ObjectCreated:Post'
  | 's3:ObjectRemoved:Delete'
  | 's3:ObjectCreated:Copy'
  | 's3:ObjectAccessed:Get'

type Identity = {
  principalId?: string
}
type RequestParameters = {
  accessKey: string
  region: string
  sourceIPAddress: string
}
type Record = {
  eventVersion: string
  eventSource: string
  awsRegion: string
  eventTime: Date
  eventName: EventName
  userIdentity: Identity
  requestParameters: RequestParameters
  responseElements: {
    'x-amz-request-id': string
    'x-minio-deployment-id': string
    'x-minio-origin-endpoint': string
    [key: string]: string
  }
  s3: {
    s3SchemaVersion: string
    configurationId: string
    bucket: {
      name: string
      ownerIdentity: Identity
      arn: string
    }
    object: {
      key: string
      size: number
      eTag: string
      contentType: string
      userMetadata: {
        'content-type': string
        [key: string]: string
      }
      sequencer: string
    }
  }
  source: {
    host: string
    port: string
    userAgent: string
  }
}

export interface S3EventMessage {
  EventName: EventName
  Key: string
  Records: Record[]
}
