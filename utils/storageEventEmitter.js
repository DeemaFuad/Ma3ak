import { NativeEventEmitter, NativeModules } from 'react-native';

// Create a custom event emitter using React Native's NativeEventEmitter
class StorageEventEmitter extends NativeEventEmitter {
  constructor() {
    super();
    this.listeners = new Map();
  }

  addListener(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(listener);
    return {
      remove: () => this.removeListener(eventType, listener)
    };
  }

  removeListener(eventType, listener) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(listener);
    }
  }

  emit(eventType, ...args) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(listener => {
        listener(...args);
      });
    }
  }
}

const storageEventEmitter = new StorageEventEmitter();

export default storageEventEmitter; 