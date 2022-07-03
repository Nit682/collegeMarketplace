import React, { useState, useEffect } from 'react'
import {collection, getDocs} from 'firebase/firestore'
import {db} from './Firebase'
import ItempostFunctional from './ItempostFunctional';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import Nav from './Nav';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AllPosts() {
    //get user from redux core
    const user = useSelector(selectUser)

    const [posts, setPosts] = useState([])

    useEffect(() => {
        const ref = collection(db, 'users/'+user.uid+'/all_posts')
        getDocs(ref).then(response =>{
            const fbposts = response.docs.map(doc => ({
                data: doc.data(),
                id: doc.id
            }))
            setPosts(fbposts)
        }).catch(error => console.log(error.message))
    }, [])

    //maps through the post objects from firebase and renders the ones that meet filter reqs as Itempost components
    function getPostComponentsMeetingFilterConstraints(lowerPriceBound, upperPriceBound, category, school, userListedBy){
        return(
          posts.map(post => {
            return <ItempostFunctional 
              key={post.id} 
              listedID={post.id} 
              data={post.data} 
              postOwnerID={user.uid}
            />
          })
        )
    }

    return (
        <div>
            <Nav />
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
                    {getPostComponentsMeetingFilterConstraints()}
                </section>
            </main>
        </div>
    )
}

export default AllPosts