
class ResponseMock {
  constructor(status = 200, jsonData = {}) {
    this.ok = status >= 200 && status < 300;
    this.status = status;
    this.headers = {};
    this.redirected = false;
    this.statusText = '';
    this.type = 'basic';
    this.url = '';
    this.body = null;
    this.bodyUsed = false;
    this.bytes = new Uint8Array();
    this._jsonData = jsonData;
  }
  async json() { return this._jsonData; }
  async text() { return JSON.stringify(this._jsonData); }
  async arrayBuffer() { return new ArrayBuffer(0); }
  async blob() { return new Blob(); }
  async formData() { return new FormData(); }
  clone() { return new ResponseMock(this.status, this._jsonData); }
}

const { SupabaseConnector } = require('../SupabaseConnector');

describe('SupabaseConnector', () => {
  it('should test connection to Supabase', async () => {
    const connector = new SupabaseConnector({
      supabaseUrl: 'https://demo.supabase.co',
      supabaseAnonKey: 'demo-key',
      tableName: 'test_messages',
      internetModule: {},
    });
    // Mock fetch to always return ok
  global.fetch = jest.fn(() => Promise.resolve(new ResponseMock(200, {})));
    const result = await connector.testConnection();
    expect(result).toBe(true);
  });

  it('should insert a message', async () => {
    const connector = new SupabaseConnector({
      supabaseUrl: 'https://demo.supabase.co',
      supabaseAnonKey: 'demo-key',
      tableName: 'test_messages',
      internetModule: {},
    });
    global.fetch = jest.fn(() => Promise.resolve(new ResponseMock(200, {})));
    const result = await connector.insertMessage('Hello', 'user', 'session123');
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 201,
      headers: {},
      redirected: false,
      statusText: '',
      type: 'basic',
      url: '',
      clone: () => this,
      body: null,
      bodyUsed: false,
      json: async () => ({}),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    }));
  });
});
