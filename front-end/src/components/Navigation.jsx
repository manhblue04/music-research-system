import { Navbar, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import "./Navigation.css"

function Navigation() {
  return (
    <Navbar bg="dark" expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-5">
          🎵 Music Hub
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export default Navigation
