import 'bootstrap';

declare global {
  interface Window {
    bootstrap: typeof import('bootstrap');
  }
}

export {};
