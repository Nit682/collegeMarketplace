import React, { useState } from 'react'
import { Avatar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ImageSlide from './ImageSlide';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

function Itempost(props) {
  const [isLiked, setIsLiked] = useState(props.data.isLikedByUserInitially)
  const [numLikes, setNumLikes] = useState(props.data.likeCount)
  const [isMarkedIP, setIsMarkedIP] = useState(props.data.isMarkedInProgressInitially)

  function toggleLike(){
    setIsLiked(prevIsLiked => {
        if (prevIsLiked === true){
            setNumLikes(numLikes-1)
        } else {
            setNumLikes(numLikes+1)
        }
        return !prevIsLiked
    })
  }

  function toggleInProgress(){
    setIsMarkedIP(prevIsMarkedIP => !prevIsMarkedIP)
  }

  return (
    <div className='bg-white my-7 border rounded-sm'>
        {/*Header */}
        <div className='flex items-center p-5'>
            <Avatar
                src={props.data.userpfp}
                className='mr-3'
                alt=""
            />
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

export default Itempost