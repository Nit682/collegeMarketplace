import React, { useState, useEffect } from 'react'
import {collection, getDocs, getDoc, doc} from 'firebase/firestore'
import {db, useAuth} from '../backend-configurations/Firebase-config'
import Nav from './Nav';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Post from './Post';

function InProgressPosts() {
    const [posts, setPosts] = useState([])
    const user = useAuth()

    useEffect(() => {
        const ipdataCollectionRef = collection(db, 'users/'+user.uid+'/in_progress')
        getDocs(ipdataCollectionRef).then(response => {
            const objects = response.docs.map(document => {
                const identification = document.data().pathOfPostMarkedInProgress
                const docref = doc(db, identification)
                const object = getDoc(docref).then(res => {
                    return {data: res.data(), id: res.id, postOwnerID: identification.substring(6,34)}
                })
                return object
            })
            Promise.all(objects).then(function(values){
                setPosts(values)
            })
        }).catch(error => console.log(error.message))
    },[])

    function getComponents(){
        if (posts.length === 0){
            return;
        }
        return (
            posts.map(post => {
                if (post.data){
                    return <Post
                        key={post.id}
                        listedID={post.id}
                        data={post.data}
                        postOwnerID={post.postOwnerID}
                        isChildPostPartOfInProgressFolder={true}
                    />
                }
            })
        )
    }

    return (
        <div>
            <Nav isHome={false} isSearch={false}/>
            <div className='h-[12vh] flex flex-col justify-center items-center w-screen'>
                <div className='h-[9vh] w-[24vw]  bg-yellow-500 flex justify-center items-center shadow-md rounded-md'>

                    <Link to='/' className='h-[7vh]'>
                        <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{}}/>

                    </Link>
                        <h1 className='text-3xl font-mono'>In Progress Posts</h1>

                </div>
            </div>
            <main className='grid grid-cols-1 md:grid-cols-2 md:max-w-3xl xl:grid-cols-3 xl:max-w-6xl mx-auto'>
                <section className='col-span-2'>
                    {getComponents()}
                </section>
            </main>
        </div>
    )
}

export default InProgressPosts