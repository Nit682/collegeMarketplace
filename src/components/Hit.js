import React, {useEffect, useState} from 'react'
import { db } from '../backend-configurations/Firebase-config'
import {doc, getDoc} from 'firebase/firestore'
import Post from './Post'

function Hit({hit}) {
    const postPath = hit.path
    const postDocID = hit.objectID
    const [postData, setPostData] = useState()

    useEffect(() => {
        const getPostData = async () => {
            const docRef = doc(db, postPath)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()){
                setPostData(docSnap.data())
            }
        }
        getPostData()
    }, [])

    return (
        <div>
            {
                postData && (
                    <Post
                        key={postDocID}
                        listedID={postDocID}
                        data={postData}
                        postOwnerID={postPath.toString().substring(6,34)}
                    />
                )
            }
        </div>
    )
}

export default Hit