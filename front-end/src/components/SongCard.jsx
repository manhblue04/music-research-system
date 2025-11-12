"use client"
import { Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import "./SongCard.css"

function SongCard({ song }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/song/${song.id}`)
  }

  return (
    <Card
      className="song-card h-100 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <Card.Img
        variant="top"
        src={song.image || "/placeholder.svg?height=200&width=200&query=music+album+cover"}
        alt={song.name}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="song-title">{song.name}</Card.Title>
        <Card.Text className="text-muted small">{song.artists}</Card.Text>
        <div className="song-info mt-auto">
          <div className="info-row">
            <span className="label">Release:</span>
            <span>{song.release_date}</span>
          </div>
          <div className="info-row">
            <span className="label">Popularity:</span>
            <span>{song.popularity}%</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default SongCard
