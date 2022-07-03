import React from 'react'
import Nav from './Nav'
import { Link } from 'react-router-dom'

function Mainpage() {
    return (
        <div className='flex flex-col h-screen items-center'>
            <Nav />
            <br />
            <br />
            <Link to='/myposts'>My Posts</Link>
            <br />
            <Link to='/liked'>Liked Posts</Link>
            <br />
            <Link to='/inprogress'>In Progress Posts</Link>
            <br />
            <Link to='/search'>Search Posts</Link>
            <br />
            <Link to='/chat'>Chat</Link>
            <br />
            <Link to='/createNewPostForm'>Create new post</Link>
            <br />
            <br />
        </div>
    )
}

export default Mainpage