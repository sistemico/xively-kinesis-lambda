import { Logger } from 'pino';

interface ProcessorContextOptions {
  readonly channel: string;
  readonly deviceId: string;
  readonly organizationId: string;
  readonly reportId?: number;
  readonly sourceId?: string;
  readonly templateId?: string;
  readonly timestamp: Date;
}

export class ProcessorContext {
  // Data
  readonly props: ProcessorContextOptions;

  // Logger reference
  logger: Logger;

  // Device state
  state?: Partial<DeviceState> = {};

  constructor({ logger, ...context }: ProcessorContextOptions & { logger: Logger }) {
    this.props = context;
    this.logger = logger.child({ context });
  }

  public resetState() {
    this.state = {};
  }

  public setState(state: Partial<DeviceState>) {
    this.state = { ...this.state, ...state };
  }
}
