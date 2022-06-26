import './App.css'
import LikedPosts from './LikedPosts';
// import Header from './Header.js'
// import Sidebar from './Sidebar'
// import Feed from './Feed'
//import Posts from './Posts'
//import PostsImproved from "./PostsImproved";
import InProgressPosts from './InProgressPosts';
import { useSelector } from 'react-redux';
import { logout, selectUser, login } from './features/userSlice';
import Login from './Login';
import React, {useEffect, useState} from 'react';
import { auth } from './Firebase';
import { useDispatch } from 'react-redux/es/exports'
import AllPosts from './AllPosts';
import SearchPosts from './SearchPosts';

function App() {
  const user = useSelector(selectUser) 
  const dispatch = useDispatch()
  const [postCategoryToRender, setPostCategoryToRender] = useState("all posts")

  useEffect(() => {
    auth.onAuthStateChanged(userAuth => {
      if (userAuth){
        //user is logged in
        dispatch(login({
          email: userAuth.email,
          uid: userAuth.uid,
          displayName: userAuth.displayName,
          photoUrl: userAuth.photoURL
        }))
      } else {
        dispatch(logout())
      }
    })
  }, [])

  const logOutOfApp = () => {
    setPostCategoryToRender("all post")
    dispatch(logout())
    auth.signOut()
  }


  return (
    <div>
      {!user ? (<Login /> ) : (
        <div>
          <button onClick={logOutOfApp}>Logout</button>

          <br />
          <br />
          <button onClick={() => setPostCategoryToRender('all posts')}>My Posts</button>
          <br />
          <button onClick={() => setPostCategoryToRender('liked posts')}>Liked Posts</button>
          <br />
          <button onClick={() => setPostCategoryToRender('in progress posts')}>In Progress Posts</button>
          <br />
          <button onClick={() => setPostCategoryToRender('search posts')}>Search Posts</button>
          <br />
          <br />

          <main className='grid grid-cols-1 md:grid-cols-2 md:max-w-3xl xl:grid-cols-3 xl:max-w-6xl mx-auto'>
            <section className='col-span-2'>
              {postCategoryToRender === 'liked posts' && <LikedPosts />}
              {postCategoryToRender === 'all posts' && <AllPosts />}
              {postCategoryToRender === 'in progress posts' && <InProgressPosts />}
              {postCategoryToRender === 'search posts' && <SearchPosts />}
            </section>
          </main>
        </div>
      )}
    </div>
  );



















  // return (
  //   <div className="app">

  //     {/* Header */}
  //     <Header />
  //     {/* App body */}

  //     <div className='app_body'>
  //       {/* Profile sidebar */}
  //       <Sidebar
  //         name="Nitish Vobilisetti"
  //         email="nvob@gmail.com"
  //         num_listed_items_by_user="3"
  //         background_img_link="http://farm3.static.flickr.com/2098/2260149771_00cb406fd6_o.jpg"
  //       />
  //       {/* Feed */}
  //       <Feed />
  //     </div>
  //   </div>
  // );
}

export default App;
