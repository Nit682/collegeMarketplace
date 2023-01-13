import { React, useState } from 'react'
import { Link } from 'react-router-dom'
import Switch from '@mui/material/Switch';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import { logOut } from '../backend-configurations/Firebase-config';

const Nav = ({ isSearch, isHome }) => {
    const [dark, setDark] = useState(false);

    function changeMode() {
        setDark(!dark);
    }

  return (
    <div className='w-full bg-white h-[13vh] shadow-md sticky'>
      <ul className='flex h-full items-center justify-between'>
        <Link to="/">
          <div className='flex items-center w-[30vw]'>
            <img src="https://digitalairstrike.com/wp/wp-content/uploads/2018/05/2018.05-Marketplace-Logo.png" className='object-contain h-[10vh] ml-[2vw]'/>
            <h1 className='ml-[2vw] text-2xl font-mono'>College Marketplace</h1>
          </div>
        </Link>

        { !isSearch && !isHome &&
        <div className=' w-[30vw] flex items-center absolute ml-[35vw]'>
          <Link to="/Search" className='w-full'>
            <Button style={{ backgroundColor: "#dbdbdb" }} sx={{ height: "50%", width: "100%", display: "flex", justifyContent: "start"}}>
                <SearchIcon style={{color: "#000000"}}/>
            </Button>
          </Link>
        </div>
      }

      <div className='flex items-center justify-end w-[20vw]'>

        {
          !isHome && (
            <Link to='/'>
              <Button variant='contained' onClick={logOut} style={{ marginRight: "10%", backgroundColor: "#000000",  }} >
                log out
              </Button>
            </Link>
          )
        }

        <div className='flex items-center justify-center border-yellow-500 border-2 p-[1vh] rounded-md mr-[2vw]'>
            {!dark ? 
            <Brightness5Icon sx={{}}/>
            :
            <ModeNightIcon />
        
        }
            <Switch onChange={changeMode} color="secondary" sx={{  }}/>
        </div>
        </div>
        
      </ul>
      
    </div>
  )
}

export default Nav