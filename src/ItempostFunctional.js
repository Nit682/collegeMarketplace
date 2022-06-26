import React, { useState, useEffect } from 'react'
import { Avatar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ImageSlide from './ImageSlide';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { doc, increment, updateDoc, collection, addDoc, deleteDoc, getDocs, where, query, getDoc } from "firebase/firestore";
import {db} from './Firebase'
import { useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';

function ItempostFunctional(props) {
  const [isLiked, setIsLiked] = useState(false)
  const [numLikes, setNumLikes] = useState(props.data.likeCount)
  const [isMarkedIP, setIsMarkedIP] = useState(false)
  const user = useSelector(selectUser)

  useEffect(() => {
    const likedCollectionref = collection(db, 'users/'+user.uid+'/liked')
    getDocs(likedCollectionref).then(response =>{
        const flag = response.docs.map(doc => ({
            truthstate: doc.data().pathOfPostLiked === "users/"+props.postOwnerID+"/all_posts/"+props.listedID
        }))
        for (let i = 0; i < flag.length; i++){
          if (flag[i].truthstate){
            setIsLiked(flag[i].truthstate)
          }
        }
    }).catch(error => console.log(error.message))

    const inProgressCollectionRef = collection(db, 'users/'+user.uid+'/in_progress')
    getDocs(inProgressCollectionRef).then(response => {
        const flag = response.docs.map(doc => ({
            truthstate: doc.data().pathOfPostMarkedInProgress === "users/"+props.postOwnerID+"/all_posts/"+props.listedID
        }))
        for (let i = 0; i < flag.length; i++){
          if (flag[i].truthstate){
            setIsMarkedIP(flag[i].truthstate)
          }
        }
    })

    if (props.componentWillBeReRenderedWithoutReload){
      const ref = doc(db, 'users/'+props.postOwnerID+'/all_posts', props.listedID)
      getDoc(ref).then(res => {
        setNumLikes(res.data().likeCount)
      })
    }
  }, [])

  function toggleLike(){
    setIsLiked(prevIsLiked => !prevIsLiked)
    if (isLiked === true){
        setNumLikes(numLikes - 1)
        updateLikesIndb(!isLiked, -1)

        //condition where user unlikes post
        //they want the post out of their liked section
        //remove the doc in 'liked' collection that holds the docID of the post in the general 'posts' collection
        deletePostIDFromLikedPostsCollection()
        console.log("deleted from liked posts")
    } else {
        setNumLikes(numLikes + 1)
        updateLikesIndb(!isLiked, 1)

        //condition where user wants to like post and link it to their liked posts section
        //push doc ID of the liked post from the 'posts' collection and add it to the 'liked collection'
        addPostIDtoLikedPostsCollection()
        console.log("added to liked posts")
    }
  }

  async function deletePostIDFromLikedPostsCollection(){
    const q = query(collection(db, 'users/'+user.uid+'/liked'), where("pathOfPostLiked", "==", "users/"+props.postOwnerID+"/all_posts/"+props.listedID));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((document) => {
        deleteDoc(doc(db, 'users/'+user.uid+'/liked', document.id));
    });
  }

  async function addPostIDtoLikedPostsCollection(){
    const likedPostsRef = collection(db, 'users/'+user.uid+'/liked')
    await addDoc(likedPostsRef, {pathOfPostLiked: "users/"+props.postOwnerID+"/all_posts/"+props.listedID})
  }

  async function updateLikesIndb(toBeUpdatedLikedState, likeCountChangeInDb){
    const ref = doc(db, 'users/'+props.postOwnerID+'/all_posts', props.listedID)

    await updateDoc(ref, {
        //isLikedByUserInitially: toBeUpdatedLikedState,
        likeCount: increment(likeCountChangeInDb)
    })
  }

  function toggleInProgress(){
    setIsMarkedIP(prevIsMarkedIP => !prevIsMarkedIP)
    //updateInProgressIndb(!isMarkedIP)

    if (isMarkedIP === true){
        //condition where user removes post from IP
        //they want the post out of their IP section
        //remove the doc in 'in_progress' collection that holds the docID of the post in the general 'posts' collection
        deletePostIDFromInProgressCollection()
        console.log("unmarked in progress")
    } else {
        //condition where user adds post to IP
        //they want the post in their IP section
        //add a doc in 'in_progress' collection that holds the docID of this post from the general 'posts' collection
        addPostIDtoInProgressCollection()
        console.log("marked in progress")
    }
  }

  async function addPostIDtoInProgressCollection(){
    const inProgressRef = collection(db, 'users/'+user.uid+'/in_progress')
    await addDoc(inProgressRef, {pathOfPostMarkedInProgress: "users/"+props.postOwnerID+"/all_posts/"+props.listedID})
  }

  async function deletePostIDFromInProgressCollection(){
    const q = query(collection(db, 'users/'+user.uid+'/in_progress'), where("pathOfPostMarkedInProgress", "==", "users/"+props.postOwnerID+"/all_posts/"+props.listedID));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((document) => {
        deleteDoc(doc(db, 'users/'+user.uid+'/in_progress', document.id));
    });
  }

  async function updateInProgressIndb(toBeUpdatedInProgress){
    const ref = doc(db, 'users/'+user.uid+'/in_progress', props.listedID)

    await updateDoc(ref, {
        isMarkedInProgressInitially: toBeUpdatedInProgress
    })
  }

  return (
    <div className='bg-white my-7 border rounded-sm'>
        {/*Header */}
        <div className='flex items-center p-5'>
          {props.data.pfp ? (
              <Avatar
                  src={props.data.pfp}
                  className='mr-3'
                  alt=""
              />
            ) : (
              <Avatar
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                className='mr-3'
                alt=""
              />
            )
          }


            <p className='flex-1 font-bold'>
                {props.data.userName}
            </p>
        </div>

        {/* image */}
        {
            props.data.itemPictureList.length > 1 ? (
                <ImageSlide data={props.data.itemPictureList}/>
            ) : (
                props.data.itemPictureList.map(item => {
                    return <img src={item} className='object-cover w-full' alt='' />
                })
            )
        }

        {/*buttons*/}
        <div className='flex justify-between px-4 pt-4'>
            <div className='flex space-x-2'>
                <div onClick={toggleLike} className='cursor-pointer'>
                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </div>
                <p>{numLikes}</p>

                <div onClick={toggleInProgress} className='cursor-pointer'>
                    {isMarkedIP ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </div>
                {isMarkedIP ? <p>Unmark in progress</p> : <p>Mark in progress</p>}
                {props.data.availabilityStatus ? <p className="text-green-700">Available</p> : <p className="text-red-600">Sold</p>}
            </div>
        </div>

        {/*captions*/}
        <p className='pl-5 pt-5 pb-2 truncate font-bold'>Contact Information</p>
        <p className='pl-10 pt-0 truncate'>Email: {props.data.contact.email}</p>
        <p className='pl-10 pb-5 pt-0 truncate'>Phone: {props.data.contact.phoneNumber}</p>
        <p className='pl-5 pt-0 pb-2 truncate font-bold'>Financials</p>
        <p className='pl-10 pb-5 truncate'>Total price: {"$"+props.data.price}</p>
        <p className='pl-5 pt-0 pb-2 truncate font-bold'>Location</p>
        <p className='pl-10 truncate'>School: {props.data.school}</p>
        <p className='pl-10 pb-5 truncate'>City: {props.data.listedCity}</p>
    </div>
  )

}

export default ItempostFunctional