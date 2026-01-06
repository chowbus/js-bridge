/**
 * AndroidAdapter - Android WebView 适配器
 */

export class AndroidAdapter {
  constructor(logger) {
    this.logger = logger;
    this.available = this.checkAvailability();
  }

  checkAvailability() {
    return typeof window !== 'undefined' &&
           typeof window.AndroidBridge !== 'undefined';
  }

  postMessage(message) {
    if (!this.available) {
      throw new Error('Android Bridge not available');
    }

    try {
      const jsonString = JSON.stringify(message);
      window.AndroidBridge.postMessage(jsonString);
      this.logger.log('Android message sent', message);
    } catch (error) {
      this.logger.error('Android message send failed', error);
      throw error;
    }
  }

  isAvailable() {
    return this.available;
  }
}

export default AndroidAdapter;