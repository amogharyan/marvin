const { RealtimeCursorBroadcaster } = require('../RealtimeCursorBroadcaster');

describe('RealtimeCursorBroadcaster', () => {
  it('should broadcast cursor position', async () => {
    const broadcaster = new RealtimeCursorBroadcaster({
      supabaseUrl: 'https://demo.supabase.co',
      supabaseAnonKey: 'demo-key',
      roomName: 'demo-room',
      internetModule: {},
    });
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
    const result = await broadcaster.broadcastCursorPosition(10, 20, 'device123');
    expect(result).toBe(true);
  });
});
