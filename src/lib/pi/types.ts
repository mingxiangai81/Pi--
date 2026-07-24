export type PiScope = 'username' | 'payments' | 'wallet_address';

export interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username: string };
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

export interface PiIncompletePayment {
  identifier: string;
  transaction?: { txid: string };
}

/** createPayment 的回调集合 —— 支付双向验证的核心 */
export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
}

export interface PiSDK {
  init(options: { version: string; sandbox?: boolean }): void;
  authenticate(
    scopes: PiScope[],
    onIncompletePaymentFound: (payment: PiIncompletePayment) => void,
  ): Promise<PiAuthResult>;
  createPayment(payment: PiPaymentData, callbacks: PiPaymentCallbacks): void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

export {};
