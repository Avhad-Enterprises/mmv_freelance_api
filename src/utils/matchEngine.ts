// utils/matchEngine.js
// ∞ Simple matching engine that calculates how well a client and creator match ∞

export function calculateEmcScore(clientId, creatorIds = []) {
    if (creatorIds.includes(clientId)) return 70; // Direct match
  
    // Artwork affinity map: defines soft matches
    const affinity = {
      1: [2, 3],
      2: [1],
      3: [4],
      4: [3],
      5: [2],
      6: [9],
      7: [1],
      8: [6],
      9: [6]
    };
  
    // Soft match check
    if (creatorIds.some(id => (affinity[clientId] || []).includes(id))) return 40;
  
    return 10; // Weak match
  }
  