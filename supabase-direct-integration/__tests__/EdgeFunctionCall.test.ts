const { EdgeFunctionCall } = require('../EdgeFunctionCall');

describe('EdgeFunctionCall', () => {
  it('should call edge function and return result', async () => {
    const edgeCall = new EdgeFunctionCall({
      internetModule: {},
      endpointUrl: 'https://demo.supabase.co/functions/health',
      publicKey: 'demo-key',
      inputName: 'healthCheck',
    });
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
      json: async () => ({ status: 'ok' }),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    }));
    const result = await edgeCall.callEdgeFunction({ test: true });
    expect(result).toEqual({ status: 'ok' });
  });
});
