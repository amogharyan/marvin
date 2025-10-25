// Adapted RealtimeCursorFollower for Marvin AR direct integration
// Follows real-time cursor/device presence from Supabase

var RealtimeCursorFollower = function(opts) {
  this.supabaseUrl = opts.supabaseUrl;
  this.supabaseAnonKey = opts.supabaseAnonKey;
  this.roomName = opts.roomName;
  this.internetModule = opts.internetModule;
}

RealtimeCursorFollower.prototype.getLatestCursorPosition = async function(deviceId) {
  // Read latest cursor position from realtime_messages table
  try {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/realtime_messages?channel=eq.${this.roomName}&event=eq.cursor-move&order=sent_at.desc&limit=1`, {
      headers: {
        apikey: this.supabaseAnonKey,
        Authorization: `Bearer ${this.supabaseAnonKey}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.length ? JSON.parse(data[0].payload) : null;
  } catch (err) {
    console.log(`Follower error: ${err}`);
    return null;
  }
};

module.exports = { RealtimeCursorFollower };
