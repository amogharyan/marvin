// Adapted SupabaseConnector for Marvin AR direct integration
// Provides CRUD, real-time, and device presence for AR client

var SupabaseConnector = function(opts) {
  this.supabaseUrl = opts.supabaseUrl;
  this.supabaseAnonKey = opts.supabaseAnonKey;
  this.tableName = opts.tableName;
  this.internetModule = opts.internetModule;
  this.channelName = 'test_channel';
  this.isConnected = false;
  this.logMessages = [];
  this.maxLogMessages = 20;
}

SupabaseConnector.prototype.log = function(message) {
  console.log(message);
  this.logMessages.push(message);
  if (this.logMessages.length > this.maxLogMessages) {
    this.logMessages = this.logMessages.slice(-this.maxLogMessages);
  }
};

SupabaseConnector.prototype.testConnection = async function() {
  // Test basic connectivity to Supabase
  try {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
      headers: {
        apikey: this.supabaseAnonKey,
        Authorization: `Bearer ${this.supabaseAnonKey}`,
      },
    });
    this.isConnected = res.ok;
    this.log(`Connection test: ${res.status}`);
    return res.ok;
  } catch (err) {
    this.log(`Connection error: ${err}`);
    return false;
  }
};

SupabaseConnector.prototype.insertMessage = async function(message, sender, lensSessionId) {
  // Insert a message into test_messages table
  const payload = {
    message,
    sender,
    lens_session_id: lensSessionId,
    timestamp: new Date().toISOString(),
  };
  try {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
      method: 'POST',
      headers: {
        apikey: this.supabaseAnonKey,
        Authorization: `Bearer ${this.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    this.log(`Insert message: ${res.status}`);
    return res.ok;
  } catch (err) {
    this.log(`Insert error: ${err}`);
    return false;
  }
};

module.exports = { SupabaseConnector };
