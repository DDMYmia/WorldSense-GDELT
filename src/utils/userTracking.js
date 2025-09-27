import { post } from 'aws-amplify/api';

// Track user activity
export const trackUserActivity = async (userId, activityType, details) => {
  try {
    await post({
      apiName: 'WorldSenseAPI',
      path: '/activity',
      options: {
        body: {
          userId,
          activityType,
          details,
          timestamp: new Date().toISOString()
        }
      }
    });
    console.log('User activity recorded:', activityType);
  } catch (error) {
    console.error('Failed to record user activity:', error);
  }
};

// Update user preferences
export const updateUserPreference = async (userId, preferenceKey, preferenceValue) => {
  try {
    await post({
      apiName: 'WorldSenseAPI',
      path: '/preferences',
      options: {
        body: {
          userId,
          preferenceKey,
          preferenceValue,
          timestamp: new Date().toISOString()
        }
      }
    });
    console.log('User preference updated:', preferenceKey);
  } catch (error) {
    console.error('Failed to update user preference:', error);
  }
};

// Track search behavior
export const trackSearch = async (userId, searchParams) => {
  await trackUserActivity(userId, 'search', {
    query: searchParams.q,
    dateRange: `${searchParams.gte} to ${searchParams.lte}`,
    bbox: searchParams.bbox,
    searchType: 'map_search'
  });
};

// Track map interactions
export const trackMapInteraction = async (userId, interactionType, details) => {
  await trackUserActivity(userId, 'map_interaction', {
    type: interactionType,
    ...details
  });
};