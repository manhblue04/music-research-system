import axios from "axios"

const API_BASE_URL = "http://localhost:5000"

const apiService = {
  // Get top N tracks
  getTopTracks: async (n = 100) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/top`, {
        params: { n },
      })
      return response.data.results || []
    } catch (error) {
      console.error("Error fetching top tracks:", error)
      throw error
    }
  },

  // Search songs by name
  searchSongs: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: query },
      })
      return response.data.results || []
    } catch (error) {
      console.error("Error searching songs:", error)
      throw error
    }
  },

  // Get recommendations based on song ID
  getRecommendations: async (trackId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommend`, {
        params: { id: trackId },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      throw error
    }
  },
}

export default apiService;
