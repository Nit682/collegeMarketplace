import React from 'react'
import { Avatar } from '@mui/material';

function Message({pfp, fromName, message}) {
  return (
    <div className='flex items-center p-5'>
        <Avatar
            src={pfp}
            className='mr-3'
            alt=""
        />
        <p className='flex-1 font-bold'>
            {fromName+": "+message}
        </p>
    </div>
  )
}

export default Message