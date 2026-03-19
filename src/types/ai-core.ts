export interface LifecycleCommandOptions {
  resourceGroup: string;
  json: boolean;
  dryRun: boolean;
}

export interface ListCommandOptions extends LifecycleCommandOptions {
  top?: number;
  skip?: number;
}

export interface AdminCommandOptions {
  json: boolean;
  dryRun: boolean;
}

export interface AdminSecretsCommandOptions extends AdminCommandOptions {
  resourceGroup: string;
}

export interface DeleteCommandOptions {
  force: boolean;
  json: boolean;
  dryRun: boolean;
}
