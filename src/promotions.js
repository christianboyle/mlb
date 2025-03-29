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
              const formattedPromotions = validPromotions
                .map(p => `${p.promotion_types || 'Promotion'}\\n${p.description || 'No description available'}`)
                .join('\\n\\n');

              promotions[date] = {
                name: validPromotions.length > 1 ? 'Multiple Promotions' : 'Single Promotion',
                description: formattedPromotions,
                url: validPromotions[0]?.alt_page_url || null
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

  // For other teams, try the API
  const params = new URLSearchParams();
  
  // Add parameters one by one to ensure proper handling of arrays
  params.append('ticket_category', 'Tickets');
  params.append('team_id', teamId);
  params.append('home_team_id', teamId);
  params.append('recSP', '1');
  params.append('site_section', 'Default');
  params.append('offer_group', 'SGTPG');
  params.append('price_group', 'Dynamic');
  params.append('begin_date', '20250321');
  params.append('end_date', '20251006');
  params.append('grouping_name', 'Default');
  params.append('display_if_past', 'false');
  params.append('leave_empty_games', 'true');
  params.append('ensure_array', 'game');
  params.append('ensure_array', 'non_game');
  params.append('tixDataAlways', 'true');
  params.append('removeNoPrice', 'false');
  params.append('displayIn', 'singlegame');
  params.append('year', '2025');
  params.append('game_status', 'S');
  params.append('display_in', 'Promotions');

  try {
    // Use our proxy endpoint with the /mlb prefix
    const response = await fetch(`/mlb/ticketing-client/json/EventTicketPromotion.tiksrv?${params}`, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // First get the response as text
    const text = await response.text();
    
    // Try to parse it as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
    
    // Process the promotions data
    const promotions = {};
    if (data.game) {
      data.game.forEach(game => {
        if (game.promotion) {
          const date = game.game_date.split('T')[0];
          promotions[date] = {
            name: game.promotion.promotion_types,
            description: game.promotion.description,
            url: game.promotion.alt_page_url || null
          };
        }
      });
    }
    
    return promotions;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return {};
  }
} 