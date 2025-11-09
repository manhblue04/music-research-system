"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import apiService from "../services/apiService"
import SongCard from "../components/SongCard"
import "./SongDetail.css"

function SongDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSongDetails()
  }, [id])

  const fetchSongDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get recommendations which also contains source song info
      const data = await apiService.getRecommendations(id)

      // Create song object from source info
      const songDetail = {
        id: id,
        name: data.source,
        artists: "Artists",
        release_date: "N/A",
        popularity: "N/A",
      }

      setSong(songDetail)
      setRecommendations(data.recommendations)
    } catch (err) {
      setError("Failed to load song details.")
      console.log("[v0] Error fetching song details:", err.message)
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Button variant="secondary" className="mb-4" onClick={() => navigate("/")}>
        ← Back
      </Button>

      {song && (
        <div className="song-detail-section mb-5">
          <h1>{song.name}</h1>
          <p className="text-muted fs-5">{song.artists}</p>
          <div className="detail-info">
            <div>
              <strong>Release Date:</strong> {song.release_date}
            </div>
            <div>
              <strong>Popularity:</strong> {song.popularity}
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-4">Similar Songs</h2>
      {recommendations.length > 0 ? (
        <Row className="g-4">
          {recommendations.map((rec) => (
            <Col key={rec.id} xs={12} sm={6} md={4} lg={3}>
              <SongCard song={rec} />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">No similar songs found.</Alert>
      )}
    </Container>
  )
}

export default SongDetail
