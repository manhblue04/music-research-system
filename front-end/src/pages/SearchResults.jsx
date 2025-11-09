"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap"
import { useSearchParams, useNavigate } from "react-router-dom"
import apiService from "../services/apiService"
import SongCard from "../components/SongCard"
import "./SearchResults.css"

function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get("q") || ""

  const [bestMatch, setBestMatch] = useState(null)
  const [allResults, setAllResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (query) {
      fetchSearchResults()
    }
  }, [query])

  const fetchSearchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      // Search for songs
      const searchData = await apiService.searchSongs(query)

      if (searchData.length === 0) {
        setError("No songs found matching your search.")
        setAllResults([])
        setRecommendations([])
        setBestMatch(null)
      } else {
        // Set best match (first result)
        setBestMatch(searchData[0])
        setAllResults(searchData)

        // Get recommendations based on best match
        try {
          const recData = await apiService.getRecommendations(searchData[0].id)
          setRecommendations(recData.recommendations)
        } catch (recErr) {
          console.log("[v0] Error fetching recommendations:", recErr.message)
          setRecommendations([])
        }
      }
    } catch (err) {
      setError("Failed to search songs.")
      console.log("[v0] Error searching songs:", err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Button variant="secondary" className="mb-4" onClick={() => navigate("/")}>
        ← Back to Home
      </Button>

      <h1 className="mb-4">Search Results for "{query}"</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {bestMatch && (
        <div className="best-match-section mb-5 p-4 bg-light rounded">
          <h3>Best Match</h3>
          <Row className="mt-3">
            <Col md={3}>
              <SongCard song={bestMatch} />
            </Col>
            <Col md={9}>
              <h5>{bestMatch.name}</h5>
              <p className="text-muted">{bestMatch.artists}</p>
              <div>
                <strong>Release Date:</strong> {bestMatch.release_date}
              </div>
              <div>
                <strong>Popularity:</strong> {bestMatch.popularity}%
              </div>
            </Col>
          </Row>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-4">Similar to Best Match</h3>
          <Row className="g-4">
            {recommendations.map((song) => (
              <Col key={song.id} xs={12} sm={6} md={4} lg={3}>
                <SongCard song={song} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {allResults.length > 0 && (
        <div>
          <h3 className="mb-4">All Search Results ({allResults.length})</h3>
          <Row className="g-4">
            {allResults.map((song) => (
              <Col key={song.id} xs={12} sm={6} md={4} lg={3}>
                <SongCard song={song} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  )
}

export default SearchResults
