//
// Devices
//

type ProvisioningState = 'defined' | 'activated' | 'associated';

// Default fields
interface DeviceProps {
  readonly created?: Date;
  readonly createdById?: string;
  readonly lastModified?: Date;
  readonly lastModifiedById?: string;
  readonly version?: string;
  readonly id?: string;
  accountId?: string;
  readonly deviceTemplateId?: string;
  organizationId?: string;
  serialNumber?: string;
  readonly provisioningState?: ProvisioningState;
  firmwareVersion?: string;
  latitude?: number;
  longitude?: number;
  connected?: boolean;
  lastConnected?: Date;
  externalIp?: string;
  readonly geoIpLatitude?: string;
  readonly geoIpLongitude?: string;
  readonly reverseDns?: string;
  channels?: Array<string>;
  name?: string;
}

interface DeviceState extends DeviceProps {
  // TODO: Here should be custom fields
}
