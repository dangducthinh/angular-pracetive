export interface ConfigurationModel {
    id: number,
    key: string,
    value: string,
    applicationName: string,
    versionNumber: string,
    lastModifiedOn: Date | null,
    lastModifiedBy: string | null
  }