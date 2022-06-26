import React, { useState, useEffect } from 'react'
import {collection, getDocs, getDoc, doc} from 'firebase/firestore'
import {db} from './Firebase'
//import Itempost from './Itempost'
import ItempostFunctional from './ItempostFunctional';
import { useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';

function InProgressPosts() {
    const [posts, setPosts] = useState([])
    const user = useSelector(selectUser)


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
                return <ItempostFunctional
                    key={post.id}
                    listedID={post.id}
                    data={post.data}
                    postOwnerID={post.postOwnerID}
                />
            })
        )
    }

    return (
        <div>{getComponents()}</div>
    )
}

export default InProgressPosts