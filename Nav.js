import { React, useState } from 'react'
import { Link } from 'react-router-dom'
import Switch from '@mui/material/Switch';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import { blue, deepPurple } from '@mui/material/colors';

const Nav = () => {
    const [dark, setDark] = useState(false);

    function changeMode() {
        setDark(!dark);
    }

  return (
    <div className='w-full bg-white h-[13vh] shadow-md sticky'>
      <ul className='flex w-full h-full items-center justify-start'>
      <img src="https://digitalairstrike.com/wp/wp-content/uploads/2018/05/2018.05-Marketplace-Logo.png" className='object-contain h-[10vh] ml-[2vw]'/>
        <h1 className='ml-[2vw] text-2xl'>College Marketplace
        </h1>
        <div className='flex items-center justify-center ml-[65vw] border-yellow-500 border-2 p-[1vh] rounded-md'>
            {!dark ? 
            <Brightness5Icon sx={{}}/>
            :
            <ModeNightIcon />
        
        }
            <Switch onChange={changeMode} color="secondary" sx={{  }}/>
        </div>
        
      </ul>
      
    </div>
  )
}

export default Nav