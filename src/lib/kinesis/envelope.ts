import * as uuid from 'node-uuid';

const ENVELOPE = {
  HEADER_VERSION: 1,
  TIME_UUID: 16,
  SOURCE_NAME_LENGTH: 2,
  // SOURCE_NAME: String,
  SOURCE_PROPERTIES_LENGTH: 2,
  // SOURCE_PROPERTIES: JSON
  TARGET_NAME_LENGTH: 2,
  // TARGET_NAME: string,
  TARGET_PROPERTIES_LENGTH: 2,
  // TARGET_PROPERTIES: JSON
  CONTENT_LENGTH: 4,
  // CONTENT_BODY: MQTT_PAYLOAD
};

type EntityProperties = {
  SchemaVersion: number,
  EntityType: 'topic' | 'device', // TODO: Confirm these values
  OrganizationIds: string[],
  TemplateId?: string,
  AccountId?: string,
  Owner: {
    Id: string,
    Properties: EntityProperties,
  },
};

export class XivelyKinesisEnvelope {
  headerVersion: number;
  timeUUID: string;
  sourceName: string;
  sourceProperties: EntityProperties;
  targetName: string;
  targetProperties: EntityProperties;
  contentBody: Buffer;

  constructor(data?: XivelyKinesisEnvelope & { contentBody: Buffer | string } | string) {
    if (typeof data === 'string') {
      this.fromBase64(data);  // Likely received a base64'd buffer
    } else if (data && data.headerVersion) {
      this.fromOptions(data); // Likely received a JS object
    }
  }

  get target() {
    const parts = this.targetName.split('/');

    return {
      channel: parts[6],
      deviceId: parts[5],
      organizationId: this.targetProperties.Owner.Properties.OrganizationIds[0],
      templateId: this.targetProperties.Owner.Properties.TemplateId,
    };
  }

  private fromOptions(data: XivelyKinesisEnvelope & { contentBody: Buffer | string }) {
    this.headerVersion = data.headerVersion;
    this.timeUUID = data.timeUUID;
    this.sourceName = data.sourceName;
    this.sourceProperties = data.sourceProperties;
    this.targetName = data.targetName;
    this.targetProperties = data.targetProperties;

    if (data.contentBody instanceof Buffer) {
      this.contentBody = data.contentBody;
    } else {
      this.contentBody = new Buffer(data.contentBody, 'base64');
    }
  }

  private fromBase64(data: string) {
    const buffer = new Buffer(data, 'base64');
    let offset = 0;

    // Header version
    const headerVersion = buffer.readUIntLE(offset, ENVELOPE.HEADER_VERSION);
    offset += ENVELOPE.HEADER_VERSION;

    // Timestamp
    const timeUUID = uuid.unparse(buffer.slice(offset, offset + ENVELOPE.TIME_UUID));
    offset += ENVELOPE.TIME_UUID;

    // Source name length
    const sourceNameLength = buffer.readUIntLE(offset, ENVELOPE.SOURCE_NAME_LENGTH);
    offset += ENVELOPE.SOURCE_NAME_LENGTH;

    // Source name
    const sourceName = buffer.slice(offset, offset + sourceNameLength).toString('utf-8');
    offset += sourceNameLength;

    // Source properties length
    const sourcePropertiesLength = buffer.readUIntLE(offset, ENVELOPE.SOURCE_PROPERTIES_LENGTH);
    offset += ENVELOPE.SOURCE_PROPERTIES_LENGTH;

    // Source properties
    const sourceProperties = buffer.slice(offset, offset + sourcePropertiesLength).toString('utf-8');
    offset += sourcePropertiesLength;

    // Target name length
    const targetNameLength = buffer.readUIntLE(offset, ENVELOPE.TARGET_NAME_LENGTH);
    offset += ENVELOPE.TARGET_NAME_LENGTH;

    // Target name
    const targetName = buffer.slice(offset, offset + targetNameLength).toString('utf-8');
    offset += targetNameLength;

    // Target properties length
    const targetPropertiesLength = buffer.readUIntLE(offset, ENVELOPE.TARGET_PROPERTIES_LENGTH);
    offset += ENVELOPE.TARGET_PROPERTIES_LENGTH;

    // Target properties
    const targetProperties = buffer.slice(offset, offset + targetPropertiesLength).toString('utf-8');
    offset += targetPropertiesLength;

    // Content length
    const contentLength = buffer.readUIntLE(offset, ENVELOPE.CONTENT_LENGTH);
    offset += ENVELOPE.CONTENT_LENGTH;

    // Content body (MQTT payload)
    const contentBody = buffer.slice(offset, offset + contentLength);

    // If there is no error then set values
    this.headerVersion = headerVersion;
    this.timeUUID = timeUUID;
    this.sourceName = sourceName;
    this.sourceProperties = sourceProperties.length ? JSON.parse(sourceProperties) : undefined;
    this.targetName = targetName;
    this.targetProperties = targetProperties.length ? JSON.parse(targetProperties) : undefined;
    this.contentBody = contentBody;
  }

  toString() {
    // Header version
    const headerVersion = Buffer.alloc(ENVELOPE.HEADER_VERSION);
    headerVersion.writeUIntLE(this.headerVersion, 0, ENVELOPE.HEADER_VERSION);

    // Timestamp
    const timestamp = Buffer.alloc(ENVELOPE.TIME_UUID);
    uuid.parse(this.timeUUID, timestamp);

    // Source name
    const sourceName = Buffer.from(this.sourceName, 'utf-8');

    // Source name length
    const sourceNameLength = Buffer.alloc(ENVELOPE.SOURCE_NAME_LENGTH);
    sourceNameLength.writeUIntLE(sourceName.byteLength, 0, ENVELOPE.SOURCE_NAME_LENGTH);

    // Source properties
    const sourceProperties = Buffer.from(this.sourceProperties ? JSON.stringify(this.sourceProperties) : '', 'utf-8');

    // Source properties length
    const sourcePropertiesLength = Buffer.alloc(ENVELOPE.SOURCE_PROPERTIES_LENGTH);
    sourcePropertiesLength.writeUIntLE(sourceProperties.byteLength, 0, ENVELOPE.SOURCE_PROPERTIES_LENGTH);

    // Target name
    const targetName = Buffer.from(this.targetName, 'utf-8');

    // Target name length
    const targetNameLength = Buffer.alloc(ENVELOPE.TARGET_NAME_LENGTH);
    targetNameLength.writeUIntLE(targetName.byteLength, 0, ENVELOPE.TARGET_NAME_LENGTH);

    // Target properties
    const targetProperties = Buffer.from(this.targetProperties ? JSON.stringify(this.targetProperties) : '', 'utf-8');

    // Target properties length
    const targetPropertiesLength = Buffer.alloc(ENVELOPE.TARGET_PROPERTIES_LENGTH);
    targetPropertiesLength.writeUIntLE(targetProperties.byteLength, 0, ENVELOPE.TARGET_PROPERTIES_LENGTH);

    // Content length
    const contentLength = Buffer.alloc(ENVELOPE.CONTENT_LENGTH);
    contentLength.writeUIntLE(this.contentBody.byteLength, 0, ENVELOPE.CONTENT_LENGTH);

    const buffer = Buffer.concat([
      headerVersion,
      timestamp,
      sourceNameLength,
      sourceName,
      sourcePropertiesLength,
      sourceProperties,
      targetNameLength,
      targetName,
      targetPropertiesLength,
      targetProperties,
      contentLength,
      this.contentBody,
    ]);

    return buffer.toString('base64');
  }
}
