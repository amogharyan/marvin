const { describe, it, expect, afterEach } = require('@jest/globals');
const jestMock = require('jest-mock');
const devicePresenceModule = require('../device-presence-client');
const dpSubscribe = devicePresenceModule.devicePresenceSubscribe;
const oiSubscribe = devicePresenceModule.objectInteractionsSubscribe;
const monitorConn = devicePresenceModule.monitorConnection;

describe('Device Presence Realtime Client', () => {
  it('should subscribe to device presence and receive updates for correct user', () => {
    const userId = 'user-123';
    const mockUpdate = jestMock.fn();
    // Mock supabase.channel
    const mockChannel = {
      on: jestMock.fn((event, cb) => {
        mockChannel._cb = cb;
        return mockChannel;
      }),
      subscribe: jestMock.fn((cb) => cb && cb('SUBSCRIBED')),
      unsubscribe: jestMock.fn(),
    };
    devicePresenceModule.supabase.channel = jestMock.fn(() => mockChannel);
    dpSubscribe(userId, mockUpdate);
    // Simulate event
    mockChannel._cb({ new: { user_id: userId, status: 'online' } });
    expect(mockUpdate).toHaveBeenCalledWith({ new: { user_id: userId, status: 'online' } });
    mockChannel.unsubscribe();
  });

  it('should subscribe to object interactions and receive updates for correct user', () => {
    const userId = 'user-456';
    const mockUpdate = jestMock.fn();
    // Mock supabase.channel
    const mockChannel = {
      on: jestMock.fn((event, cb) => {
        mockChannel._cb = cb;
        return mockChannel;
      }),
      subscribe: jestMock.fn((cb) => cb && cb('SUBSCRIBED')),
      unsubscribe: jestMock.fn(),
    };
    devicePresenceModule.supabase.channel = jestMock.fn(() => mockChannel);
    oiSubscribe(userId, mockUpdate);
    // Simulate event
    mockChannel._cb({ new: { user_id: userId, interaction_type: 'touch' } });
    expect(mockUpdate).toHaveBeenCalledWith({ new: { user_id: userId, interaction_type: 'touch' } });
    mockChannel.unsubscribe();
  });

  it('should monitor connection and warn if disconnected', async () => {
    // Mock getSubscriptions and removeAllSubscriptions
    devicePresenceModule.supabase.getSubscriptions = jestMock.fn(() => [{ isConnected: () => false }]);
    devicePresenceModule.supabase.removeAllSubscriptions = jestMock.fn().mockResolvedValue([]);
    const spy = jestMock.spyOn(console, 'warn').mockImplementation(() => {});
    await monitorConn();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  afterEach(async () => {
    // Clean up all subscriptions and disconnect Supabase
    if (devicePresenceModule.supabase.removeAllSubscriptions) {
      await devicePresenceModule.supabase.removeAllSubscriptions();
    }
    if (devicePresenceModule.supabase.realtime && typeof devicePresenceModule.supabase.realtime.disconnect === 'function') {
      devicePresenceModule.supabase.realtime.disconnect();
    }
    // Clear all mocks
    Object.values(jestMock).forEach(fn => {
      if (typeof fn.mockClear === 'function') fn.mockClear();
    });
  });
});
