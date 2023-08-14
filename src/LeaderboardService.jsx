import FirestoreService from './FirestoreService';

const LeaderboardService = {

  getLeaderboardData: async () => {
    try {
      const users = await FirestoreService.getAllUsers();
      return users.sort((a, b) => b.plants - a.plants);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  }
};

export default LeaderboardService;