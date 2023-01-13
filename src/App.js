import './App.css';
import {signInWithGoogle, logOut, useAuth} from './backend-configurations/Firebase-config'
import React, {useState, useEffect, useContext} from 'react'
import {Routes, Route, Link} from 'react-router-dom'
import Mainpage from './components/Mainpage';
import HomePage from './components/Homepage';
import AllPosts from './components/AllPosts'
import LikedPosts from './components/LikedPosts'
import InProgressPosts from './components/InProgressPosts'
import Chat from './components/Chat'
import NewPostForm from './components/NewPostForm';
import Search from './components/Search'

function App() {
  const user = useAuth()
  return (
      <div>
          {
              user ? (
                  <Routes>
                      <Route path='/' element={<Mainpage />} />
                      <Route path='/myposts' element={<AllPosts />} />
                      <Route path='/liked' element={<LikedPosts />} />
                      <Route path='/inprogress' element={<InProgressPosts />} />
                      <Route path='/Search' element={<Search />} />
                      <Route path='/chat' element={<Chat />} />
                      <Route path='/createNewPostForm' element={<NewPostForm />} />
                      <Route path='*' element={<div>404 Page not found</div>} />
                  </Routes>
              ) : (
                  <Routes>
                      <Route path='/' element={<HomePage />} />
                      <Route path='*' element={<div>404 Page not found</div>} />
                  </Routes>
              )
          }
      </div>
  );
}

export default App;
