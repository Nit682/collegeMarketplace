import React, { useState, useEffect } from 'react'
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ImageSlide from './ImageSlide';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { doc, increment, updateDoc, collection, addDoc, deleteDoc, getDocs, where, query, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import {db, storage} from '../backend-configurations/Firebase-config'
import { useAuth } from '../backend-configurations/Firebase-config';
import Card from '@mui/material/Card';
import PaidIcon from '@mui/icons-material/Paid';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteObject, ref } from 'firebase/storage';
import { searchIndex } from '../backend-configurations/Algolia';

function Post(props){
    const [isLiked, setIsLiked] = useState(false)
    const [numLikes, setNumLikes] = useState(props.data.likeCount)
    const [isMarkedIP, setIsMarkedIP] = useState(false)
    const user = useAuth()
    const [isChildPostPartOfLikedFolder, setIsChildPostPartOfLikedFolder] = useState(props.isChildPostPartOfLikedFolder)
    const [isChildPostPartOfInProgressFolder, setIsChildPostPartOfInProgressFolder] = useState(props.isChildPostPartOfInProgressFolder)
    const [isChildPostPartOfAll_postsFolder, setIsChildPostPartOfAll_postsFolder] = useState(props.isChildPostPartOfAll_postsFolder)

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
            if (isChildPostPartOfLikedFolder){
              setIsChildPostPartOfLikedFolder(false)
              console.log('unliked from UI')
            }
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
            if (isChildPostPartOfInProgressFolder){
              setIsChildPostPartOfInProgressFolder(false)
              console.log('unmarked from in progress in UI')
            }
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

    function deletePost(){
        const performDelete = async () => {
            const imgRefs = props.data.itemPictureListRefs
            await deleteDoc(doc(db, `users/${user.uid.toString()}/all_posts`, props.listedID))
            for (let i = 0; i < imgRefs.length; i++){
                const reference = ref(storage, imgRefs[i])
                deleteObject(reference).then(() => {}).catch(error => console.log(error))
            }
            //deleting post for public search bank in algolia
            searchIndex.deleteObjects([props.listedID])
        }
        performDelete()
        if (isChildPostPartOfAll_postsFolder){
            setIsChildPostPartOfAll_postsFolder(false)
        }
    }

    function listOnSingleLine(lst){
        let line = ''
        for (let i = 0; i < lst.length; i++){
            if (i === lst.length - 1) {
                line += lst[i]
            } else {
                line += lst[i] + ', '
            }
        }
        return line
    }

    function createNewContact() {
        const initializeConvosAndContactsOnClientSides = async () => {
            const docRef = doc(db, 'userData/'+props.data.contact.email.toString())
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()){
                const newContactData = docSnap.data()
                const localClientContactListRef = doc(db, 'users/'+user.uid.toString()+'/contactList', 'list')
                await updateDoc(localClientContactListRef, {
                    contacts: arrayUnion(newContactData)
                })
                setDoc(doc(db, 'users/'+user.uid.toString()+'/messages','convoWith'+props.postOwnerID.toString()), {});
                
                const foreignClientContactListRef = doc(db, 'users/'+props.postOwnerID.toString()+'/contactList', 'list')
                await updateDoc(foreignClientContactListRef, {
                    contacts: arrayUnion({
                        name: user.displayName,
                        uid: user.uid
                    })
                })
                setDoc(doc(db, 'users/'+props.postOwnerID.toString()+'/messages','convoWith'+user.uid.toString()), {});

                alert(newContactData.name.toString()+' is added to contacts.')
            } else {
                alert('Email does not exist')
            }
        }
        initializeConvosAndContactsOnClientSides()
    }

    return (
        <div>
            {
                (
                    (isChildPostPartOfInProgressFolder === undefined && 
                        isChildPostPartOfLikedFolder === undefined &&
                        isChildPostPartOfAll_postsFolder === undefined
                    ) ||
                    (isChildPostPartOfInProgressFolder) ||
                    (isChildPostPartOfLikedFolder) ||
                    (isChildPostPartOfAll_postsFolder)
                ) && (
                    <Card className='bg-white  w-[50vw] h-[72vh] m-20'>
                        {/*Header */}
                        <div className=' flex items-center justify-between p-[1vw] h-[10vh] shadow-md z-40'>
                        <div className='flex items-center'>
                        {props.data.pfp ? (
                            <Avatar
                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                className='mr-[1vw] shadow-sm'
                                alt=""
                                sx={{  }}
                            />
                            ) : (
                            <Avatar
                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                className='mr-[1vw] shadow-sm'
                                alt=""
                                sx={{  }}
                            />
                            )
                        }


                            <p className=''>
                                {props.data.userName}
                            </p>
                            </div>
                        <div className=''>
                            <Chip className='shadow-md' style={{ backgroundColor: "#34eb61" }} label={ <div className='flex gap-1 items-center justify-center'><PaidIcon /> <p className=' text-lg font-bold'>{props.data.price.toFixed(2)}</p></div> }/>
                        </div>


                        </div>
                        

                        {/* image */}
                        <div className='z-0 mt-[1vh] h-[40vh] flex justify-center'>
                        {
                            props.data.itemPictureList.length > 1 ? (
                                <ImageSlide data={props.data.itemPictureList}/>
                            ) : (
                                props.data.itemPictureList.map(item => {
                                    return <img src={item} className='h-[40vh] object-contain' alt='' />
                                })
                            )
                            }
                        </div>
                            
                        {/*buttons*/}
                        <div className='flex justify-start items-center ml-[1vw] mt-[3vh] drop-shadow-lg'>
                                <div onClick={toggleLike} className='cursor-pointer mr-[0.5vw]'>
                                    {isLiked ? <FavoriteIcon className=' animate-ping-one' style={{ color: "#eb5146" }}/> : <FavoriteBorderIcon />}
                                </div>
                                <div className='cursor-pointer mr-[0.5vw]'>
                                    {numLikes}
                                </div>

                                <div onClick={toggleInProgress} className='cursor-pointer mr-[0.5vw]'>
                                    {isMarkedIP ? <BookmarkIcon style={{ color: "#048a28" }} className=' animate-ping-one'/> : <BookmarkBorderIcon />}
                                </div>
                                {
                                    (user.uid !== props.postOwnerID) && (
                                        <div onClick={createNewContact} className='cursor-pointer mr-[0.5w]'>
                                            <Link to='/chat'>
                                                <MessageIcon />
                                            </Link>
                                        </div>
                                    )
                                }
                                {
                                    (user.uid === props.postOwnerID && isChildPostPartOfAll_postsFolder) && (
                                        <div onClick={deletePost} className='cursor-pointer mr-[0.5vw]'>
                                            {<DeleteIcon />}
                                        </div>
                                    )
                                }
                                {props.data.availabilityStatus ? <p className="text-green-700">Available</p> : <p className="text-red-600">Sold</p>}
                                <Chip style={{ backgroundColor: "#426cf5", color: "#ffffff", marginLeft: "2%", cursor: "pointer" }} label={props.data.school}/>
                        
                            </div>

                        {/*captions*/}
                        <div className='flex justify-between mt-[1vh] drop-shadow-lg'>
                            {(props.data.description || props.data.categories.length > 0) ? (
                                <p className='ml-[1vw] w-[35vw] p-1 shadow-md rounded-lg'>
                                    {props.data.description && <div>{props.data.description} <br /></div>}
                                    {
                                        props.data.categories.length > 0 && (
                                            <div><strong>{listOnSingleLine(props.data.categories)}</strong>{props.data.itemNameList.length > 0 && ':'} {listOnSingleLine(props.data.itemNameList)}</div>
                                        )
                                    }
                                </p>
                            ) : (
                                <strong className='ml-[1vw] w-[35vw] p-1 shadow-md rounded-lg'>No associated category</strong>
                            )}
                            <div className='flex flex-col mr-[1vw] shadow-md rounded-lg p-1'>
                                <p className=''>{props.data.contact.email}</p>
                                <p className=''>{props.data.contact.phoneNumber}</p>
                            
                            </div>
                        </div>
                    </Card>
                )
            }
        </div>
    )
}

export default Post