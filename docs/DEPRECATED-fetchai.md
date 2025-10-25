# ⚠️ DEPRECATED - Fetch.ai Documentation

**Status:** ❌ Not in use  
**Reason:** Out of scope for 36-hour hackathon  
**Deprecated:** October 25, 2025

---

## Migration Notice

This documentation is kept for reference only. Marvin AR assistant does not use Fetch.ai autonomous agents.

### Why Not Included

- **Complexity:** Autonomous agent framework too complex for 36-hour timeline
- **Scope:** Core features (AR, AI, voice, learning) take priority
- **Alternative:** Direct API integration via Fetch API instead

### Current Integration Approach

Marvin uses direct HTTP integrations via Lens Studio's `InternetModule`:

```typescript
// Direct API calls via Fetch API
const response = await this.internetModule.fetch(
  new Request(url, { method: 'POST', body: data })
);
```

See `snap-spectacles-api-reference.md` for Fetch API documentation.

---

## Archive Information

**Original Purpose:** Autonomous task agents  
**Replacement:** Direct API integration patterns  
**Archive Date:** October 25, 2025

---

