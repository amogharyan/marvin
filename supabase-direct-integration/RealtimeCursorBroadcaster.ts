// Adapted RealtimeCursorBroadcaster for Marvin AR direct integration
// Broadcasts cursor/device presence to Supabase for real-time sync

var RealtimeCursorBroadcaster = function(opts) {
  this.supabaseUrl = opts.supabaseUrl;
  this.supabaseAnonKey = opts.supabaseAnonKey;
  this.roomName = opts.roomName;
  this.internetModule = opts.internetModule;
  this.broadcastInterval = 0.2;
  this.enableCleanup = true;
  this.maxDataAge = 30;
}

RealtimeCursorBroadcaster.prototype.broadcastCursorPosition = async function(x, y, deviceId) {
  // Write cursor position to realtime_messages table
  const payload = {
    channel: this.roomName,
    event: 'cursor-move',
    payload: JSON.stringify({ x, y, deviceId }),
    sent_at: new Date().toISOString(),
  };
  try {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/realtime_messages`, {
      method: 'POST',
      headers: {
        apikey: this.supabaseAnonKey,
        Authorization: `Bearer ${this.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.log(`Broadcast error: ${err}`);
    return false;
  }
};

module.exports = { RealtimeCursorBroadcaster };
