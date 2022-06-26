import React from 'react'
import './Header.css'
function Header() {
  const logo_image_link = "https://www.pngitem.com/pimgs/m/529-5295750_facebook-marketplace-01-marketplace-facebook-logo-png-transparent.png"
  return (
    <div className="header">
        <div className="header_center">
            <img src={logo_image_link}/>
            <h1>College Marketplace</h1>
        </div>

        <div className="header_right">
            <button>Logout</button>
        </div>
    </div>
  )
}

export default Header