const { RealtimeCursorFollower } = require('../RealtimeCursorFollower');

describe('RealtimeCursorFollower', () => {
  it('should get latest cursor position', async () => {
    const follower = new RealtimeCursorFollower({
      supabaseUrl: 'https://demo.supabase.co',
      supabaseAnonKey: 'demo-key',
      roomName: 'demo-room',
      internetModule: {},
    });
    const mockPayload = JSON.stringify({ x: 10, y: 20, deviceId: 'device123' });
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      headers: {},
      redirected: false,
      statusText: '',
      type: 'basic',
      url: '',
      clone: () => this,
      body: null,
      bodyUsed: false,
      json: async () => ([{ payload: mockPayload }]),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    }));
    const result = await follower.getLatestCursorPosition('device123');
    expect(result).toEqual({ x: 10, y: 20, deviceId: 'device123' });
  });
});
