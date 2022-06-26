
import React from 'react'
import './Sidebar.css'
import Avatar from '@mui/material/Avatar';

function Sidebar(props) {
  return (
    <div className='sidebar'>
        <div className="sidebar_top">
            <img src={props.background_img_link} alt=""/>
            <Avatar className='sidebar_avatar'/>
            <h2>{props.name}</h2>
            <h4>{props.email}</h4>
        </div>

        <div className='sidebar_stats'>
            <div className="sidebar_stat">
                <p>Number of listed items</p>
                <p className='sidebar_statNumber'>
                    {props.num_listed_items_by_user}
                </p>
            </div>
        </div>
    </div>
  )
}

export default Sidebar