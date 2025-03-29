// Remove the direct import since we'll fetch the data
export async function getTeamPromotions(teamId) {
  // For Royals (teamId: 7), use static data
  if (String(teamId) === '7') {
    try {
      const response = await fetch('/data/royals-promotions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const royalsPromotions = await response.json();
      
      const promotions = {};
      const games = royalsPromotions.events?.game || royalsPromotions.game || [];
      if (games.length > 0) {
        games.forEach(game => {
          if (game.promotion) {
            const date = game.game_date.split('T')[0];
            
            // Handle both single promotion object and array of promotions
            const promotionArray = Array.isArray(game.promotion) ? game.promotion : [game.promotion];
            
            // Filter out promotions without types or descriptions
            const validPromotions = promotionArray.filter(p => p.promotion_types || p.description);
            
            if (validPromotions.length > 0) {
              promotions[date] = {
                name: validPromotions.length > 1 ? 'Multiple Promotions' : validPromotions[0].promotion_types || 'Promotion',
                promotions: validPromotions.map(p => ({
                  type: p.promotion_types || 'Promotion',
                  name: p.offer_name || null,
                  description: p.description || null,
                  image_url: p.image_url || null,
                  url: p.alt_page_url || null,
                  distribution: p.distribution || null,
                  presenter: p.presented_by || null
                }))
              };
            }
          }
        });
      }
      return promotions;
    } catch (error) {
      console.error('Error loading Royals promotions:', error);
      return {};
    }
  }

  // For all other teams, return empty object
  return {};
} 