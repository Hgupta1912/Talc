const EPSILON = 0.3;

// Keep medium names consistent
const normalizeMedium = (medium) =>
  medium.trim().toLowerCase();

// Select a medium using epsilon-greedy
const selectMedium = (artworks, stats = {}) => {
  const mediums = [
    ...new Set(artworks.map(a => normalizeMedium(a.medium)))
  ];

  if (mediums.length === 0) return null;

  // Explore, or initialize a new user randomly
  if (Math.random() < EPSILON || Object.keys(stats).length === 0) {
    return mediums[Math.floor(Math.random() * mediums.length)];
  }

  // Exploit the medium with the highest estimated reward
  const score = (medium) => {
    const { shown = 0, commented = 0 } = stats[medium] || {};
    return (commented + 1) / (shown + 2);
  };

  const bestScore = Math.max(...mediums.map(score));
  const bestMediums = mediums.filter(m => score(m) === bestScore);

  return bestMediums[Math.floor(Math.random() * bestMediums.length)];
};


const recommendArtworks = (artworks, engagement = {}, limit = 10) => {
  const remaining = [...artworks];
  const recommended = [];

  // Working copy so selection accounts for each recommendation
  const stats = structuredClone(engagement.stats || {});

  while (remaining.length > 0 && recommended.length < limit) {
    const medium = selectMedium(remaining, stats);

    const candidates = remaining.filter(
      artwork => normalizeMedium(artwork.medium) === medium
    );

    const artwork = candidates[
      Math.floor(Math.random() * candidates.length)
    ];

    recommended.push(artwork);

    // Prevent recommending the same artwork twice
    const index = remaining.findIndex(a => a.id === artwork.id);
    remaining.splice(index, 1);

    // Update temporary statistics for subsequent selections
    const current = stats[medium] || { shown: 0, commented: 0 };
    stats[medium] = {
      ...current,
      shown: current.shown + 1,
    };
  }

  return recommended;
};


const recordRecommendations = (engagement = {}, artworks) => {
  const stats = { ...(engagement.stats || {}) };

  for (const artwork of artworks) {
    const medium = normalizeMedium(artwork.medium);
    const current = stats[medium] || { shown: 0, commented: 0 };

    stats[medium] = {
      ...current,
      shown: current.shown + 1,
    };
  }

  const lastRecommendations = artworks.map(artwork => ({
    artworkId: artwork.id,
    medium: normalizeMedium(artwork.medium),
    rewarded: false,
  }));

  return {
    stats,
    lastRecommendations,
  };
};


const rewardRecommendation = (engagement = {}, artworkId) => {
  const recommendations = engagement.lastRecommendations || [];

  const match = recommendations.find(
    rec => rec.artworkId === artworkId
  );

  if (!match || match.rewarded) {
    return null;
  }

  const stats = { ...(engagement.stats || {}) };
  const current = stats[match.medium] || {
    shown: 0,
    commented: 0,
  };

  stats[match.medium] = {
    ...current,
    commented: current.commented + 1,
  };

  return {
    ...engagement,
    stats,
    lastRecommendations: recommendations.map(rec =>
      rec.artworkId === artworkId
        ? { ...rec, rewarded: true }
        : rec
    ),
  };
};


module.exports = {
  recommendArtworks,
  recordRecommendations,
  rewardRecommendation,
};
