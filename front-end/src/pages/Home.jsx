"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import ReactPaginate from "react-paginate"
import apiService from "../services/apiService"
import SongCard from "../components/SongCard"
import "../styles/pagination.css"
import "./Home.css"

function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const songsPerPage = 12
  const navigate = useNavigate()

  // Load top 100 songs on mount
  useEffect(() => {
    fetchTopSongs()
  }, [])

  const fetchTopSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getTopTracks(100)
      setSongs(data)
      setCurrentPage(0)
    } catch (err) {
      setError("Failed to load songs. Please make sure backend is running on http://localhost:5000")
      console.log("[v0] Error fetching songs:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Pagination logic
  const totalPages = Math.ceil(songs.length / songsPerPage)
  const startIndex = currentPage * songsPerPage
  const endIndex = startIndex + songsPerPage
  const currentSongs = songs.slice(startIndex, endIndex)

  return (
    <Container className="py-5">
      {/* Input search */}
      <div className="search-section mb-5">
        <h1 className="mb-4">Popular Songs</h1>
        <Form onSubmit={handleSearch}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search songs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              className="search-input"
            />
          </Form.Group>
        </Form>
      </div>
      {/* End Input search */}
      
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-5">
            {currentSongs.map((song) => (
              <Col key={song.id} xs={12} sm={6} md={4} lg={3}>
                <SongCard song={song} />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={totalPages}
              previousLabel="< previous"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
            />
          )}
        </>
      )}
    </Container>
  )
}

export default Home
