import React from 'react'
import { Avatar } from '@mui/material';

function Message({pfp, fromName, message, received}) {
  return (
    <div className='mt-[1vh]'>
    { received ?
    <div className='flex items-center drop-shadow-md float-left'>
        
            <Avatar
                src={pfp}
                className=''
                alt=''
                sx={{ transform: "scale(0.8)" }}
            >{fromName.charAt(0)}</Avatar>
            
        <p className=' text-sm ml-[0.3vw] p-2 rounded-3xl bg-slate-50'>
            {message}
        </p>
    </div>
    :
    <div className='flex items-center drop-shadow-md float-right'>
            
        <p className=' text-sm ml-[0.3vw] p-2 rounded-3xl bg-amber-200'>
            {message}
        </p>
    </div>

    }
    </div>
  )
}

export default Message