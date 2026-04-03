/**
 * Provider adapter interface — all channel providers must implement this.
 */
export interface MessageProvider {
  send(destination: string, body: string, config: any): Promise<ProviderResponse>;
}

export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
}
