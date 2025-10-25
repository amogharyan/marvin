// Adapted EdgeFunctionCall for Marvin AR direct integration
// Calls Supabase Edge Functions for health, nutrition, calendar, learning

var EdgeFunctionCall = function(opts) {
  this.internetModule = opts.internetModule;
  this.endpointUrl = opts.endpointUrl;
  this.publicKey = opts.publicKey;
  this.inputName = opts.inputName;
}

EdgeFunctionCall.prototype.callEdgeFunction = async function(payload) {
  try {
    const res = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.publicKey}`,
        apikey: this.publicKey,
      },
      body: JSON.stringify(payload || { name: this.inputName }),
    });
    return await res.json();
  } catch (err) {
    console.log(`EdgeFunction error: ${err}`);
    return null;
  }
};

module.exports = { EdgeFunctionCall };
