/**
 * iOSAdapter - iOS WebKit 适配器
 */

export class iOSAdapter {
  constructor(logger) {
    this.logger = logger;
    this.available = this.checkAvailability();
  }

  checkAvailability() {
    return typeof window !== 'undefined' &&
           typeof window.webkit !== 'undefined' &&
           window.webkit.messageHandlers &&
           window.webkit.messageHandlers.NativeBridge;
  }

  postMessage(message) {
    if (!this.available) {
      throw new Error('iOS WebKit Bridge not available');
    }

    try {
      window.webkit.messageHandlers.NativeBridge.postMessage(message);
      this.logger.log('iOS message sent', message);
    } catch (error) {
      this.logger.error('iOS message send failed', error);
      throw error;
    }
  }

  isAvailable() {
    return this.available;
  }
}

export default iOSAdapter;