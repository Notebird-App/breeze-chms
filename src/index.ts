const DEFAULT_HOST = 'breezechms.com';

export default class Breeze {
  subdomain: string;
  key: string;

  constructor(subdomain: string, key: string) {
    this.subdomain = subdomain;
    this.key = key;
  }

  hello() {
    return 'hello world';
  }
}
