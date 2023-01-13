import React, { useState, useEffect } from 'react'
import {collection, getDocs, orderBy, query} from 'firebase/firestore'
import {db} from '../backend-configurations/Firebase-config'
import Nav from './Nav';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Post from './Post'
import {useAuth} from '../backend-configurations/Firebase-config'

function AllPosts() {
    const user = useAuth()

    const [posts, setPosts] = useState([])

    useEffect(() => {
        const getPostsFromDatabase = async () => {
            const ref = collection(db, 'users/'+user.uid+'/all_posts')
            const q = query(ref, orderBy('timestamp', 'desc'))
            const qsnap = await getDocs(q)
            let fbposts = []
            qsnap.forEach(doc => {
                fbposts.push({
                    data: doc.data(),
                    id: doc.id
                })
            })
            setPosts(fbposts)
        }
        getPostsFromDatabase()
    }, [])

    //maps through the post objects from firebase and renders the ones that meet filter reqs as Itempost components
    function getPostComponents(){
        if (posts.length == 0) {
            return;
        }
        return(
          posts.map(post => {
            return <Post
                key={post.id}
                listedID={post.id}
                data={post.data}
                postOwnerID={user.uid}
                isChildPostPartOfAll_postsFolder={true}
            />
          })
        )
    }

    return (
        <div>
            <Nav isHome={false} isSearch={false}/>
            <div className='h-[10vh] flex flex-col justify-center items-center w-screen'>
                <div className='h-[7vh] w-[16vw]  bg-yellow-500 flex justify-center items-center shadow-md rounded-md'>

                    <Link to='/' className='h-[7vh]'>
                        <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{}}/>

                    </Link>
                        <h1 className='text-3xl font-mono'>My Posts</h1>

                </div>
            </div>
            <main className='grid grid-cols-1 md:grid-cols-2 md:max-w-3xl xl:grid-cols-3 xl:max-w-6xl mx-auto'>
                <section className='col-span-2'>
                    {getPostComponents()}
                </section>
            </main>
        </div>
    )
}

export default AllPosts