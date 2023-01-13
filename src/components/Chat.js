import {db, useAuth} from '../backend-configurations/Firebase-config'
import {collection, addDoc, query, getDocs, orderBy, setDoc, doc, getDoc, updateDoc, arrayUnion, onSnapshot, arrayRemove, deleteDoc} from 'firebase/firestore'
import { serverTimestamp } from "firebase/firestore";
import {useState, React, useEffect} from 'react'
import Nav from './Nav'
import Card from '@mui/material/Card';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom'
import Message from './Message'
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOffIcon from '@mui/icons-material/EditOff';


function Chat() {
    const user = useAuth()
    const [selectedContact, setSelectedContact] = useState({uid: 'new'})
    const [existingContacts, setExistingContacts] = useState([])
    const [newContactEmail, setNewContactEmail] = useState('')
    const [messagesWithContact, setMessagesWithContact] = useState([])
    const [enteredMessage, setEnteredMessage] = useState('')
    const [add, setAdd] = useState(false)
    const [menu, setMenu] = useState(false)
    function toggleMenu() {
        setMenu(!menu)
    }


    function broAdd() {
        setAdd(!add)
    }

    useEffect(() => {
        getExistingContacts()
        if (selectedContact.uid !== 'new'){
            getConversation()
        }
    }, [selectedContact])

    async function getExistingContacts(){
        const docRef = doc(db, 'users/'+user.uid.toString()+'/contactList', 'list')
        const docSnap = await getDoc(docRef)
        setExistingContacts(docSnap.data().contacts)
    }

    async function getConversation(){
        const ref = collection(db, 'users/'+user.uid.toString()+'/messages/convoWith'+selectedContact.uid.toString()+'/_collection')
        const q = query(ref, orderBy('timestamp', 'asc'))
        const qsnap = await getDocs(q)
        let messageData = []
        qsnap.forEach((messageDoc) => {
            messageData.push({
                id: messageDoc.id,
                data: messageDoc.data()
            })
        })
        setMessagesWithContact(messageData)
    }

    function liveConvoListener(){
        const ref = collection(db, 'users/'+user.uid.toString()+'/messages/convoWith'+selectedContact.uid.toString()+'/_collection')
        const q = query(ref, orderBy('timestamp', 'asc'))
        onSnapshot(q, (querySnapshot) => {
            let messageData = []
            querySnapshot.forEach((doc) => {
                messageData.push({
                    id: doc.id,
                    data: doc.data()
                })
            });
            setMessagesWithContact(messageData)
        });
    }

    function createNewContact(e){
        /*
        1. create new contact of entered email in local user db
            - make sure target email exists, if not, function should return alert
            - get target user data from entered email
            - add this data to list document of contactList collection
            - create an empty conversation with target user on client side
        2. create new contact of local user in target db
        */
        e.preventDefault()
        const initializeConvosAndContactsOnClientSides = async () => {
            const docRef = doc(db, 'userData/'+newContactEmail.toString())
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()){
                const newContactData = docSnap.data()
                const localClientContactListRef = doc(db, 'users/'+user.uid.toString()+'/contactList', 'list')
                await updateDoc(localClientContactListRef, {
                    contacts: arrayUnion(newContactData)
                })
                setDoc(doc(db, 'users/'+user.uid.toString()+'/messages','convoWith'+newContactData.uid.toString()), {});
                
                const foreignClientContactListRef = doc(db, 'users/'+newContactData.uid.toString()+'/contactList', 'list')
                await updateDoc(foreignClientContactListRef, {
                    contacts: arrayUnion({
                        name: user.displayName,
                        uid: user.uid
                    })
                })
                setDoc(doc(db, 'users/'+newContactData.uid.toString()+'/messages','convoWith'+user.uid.toString()), {});

                //alert(newContactData.name.toString()+' is added to contacts.')
                broAdd()
            } else {
                alert('Email does not exist')
            }
        }
        initializeConvosAndContactsOnClientSides()
        getExistingContacts()
        setNewContactEmail('')
    }

    function deleteUser(contact) {
        //uid notation: contact.uid.toString()
        //delete from contacts *query by uid attribute*
        //delete document "convoWith\uid\"
        async function deleteUserAsyncOperation() {
            console.log(contact.uid)
            const docRef = doc(db, 'users/'+user.uid.toString()+'/contactList', 'list')
            const deletedUserID = contact.uid.toString()
            await updateDoc(docRef, {
                contacts: arrayRemove({
                    name: contact.name,
                    uid: contact.uid
                })
            })
            await deleteDoc(doc(db, 'users/'+user.uid.toString()+'/messages','convoWith'+deletedUserID))

            //delete from other client side
            const docRef2 = doc(db, 'users/'+deletedUserID+'/contactList', 'list')
            await updateDoc(docRef2, {
                contacts: arrayRemove({
                    name: user.displayName,
                    uid: user.uid
                })
            })
            await deleteDoc(doc(db, 'users/'+deletedUserID+'/messages','convoWith'+user.uid.toString()))
        }
        deleteUserAsyncOperation()
        getExistingContacts()
    }

    function sendMessage(e){
        e.preventDefault()
        if (!enteredMessage || selectedContact.uid === 'new') {
            return
        }
        const createMessageInBothClientSideData = async () => {
            //adding message to our local client data
            const localClientConvoRef = collection(db, 'users/'+user.uid+'/messages/convoWith'+selectedContact.uid.toString()+'/_collection')
            
            //displayName may be null in local client session
            //create end case scenario to account for nullpointer
            let fromName = ''
            if (user.displayName){
                fromName = user.displayName
            } else {
                fromName = user.email
            }

            await addDoc(localClientConvoRef, {
                fromUser: {
                    uid: user.uid,
                    name: fromName
                },
                toUser: selectedContact,
                message: enteredMessage,
                timestamp: serverTimestamp()
            })

            //adding message to other client data
            const otherClientConvoRef = collection(db, 'users/'+selectedContact.uid+'/messages/convoWith'+user.uid.toString()+'/_collection')
            //check if this collection exists because it may be removed by other user
            // const snap = await otherClientConvoRef.get()
            // if (snap.empty) {
            //     alert('User has removed you.')
            //     return;
            // }
            await addDoc(otherClientConvoRef, {
                fromUser: {
                    uid: user.uid,
                    name: user.displayName
                },
                toUser: selectedContact,
                message: enteredMessage,
                timestamp: serverTimestamp()
            })
        }
        createMessageInBothClientSideData()
        setEnteredMessage('')
    }

    function renderConversation() {
        return (
            <div class="min-h-screen bg-gray-100 p-8">
                <div class="max-w-4xl mx-auto space-y-12 grid grid-cols-1">
                    {messagesWithContact.map(msg => {
                        return <Message isMessageFromUser={msg.data.fromUser.uid === user.uid} message={msg.data.message} />
                    })}
                </div>
            </div>
        )
    }

    return (
        <>
        {liveConvoListener()}
        <div className='absolute'>
                <Nav isHome={false} isSearch={false}/>
                <div className='h-[10vh] flex flex-col justify-center items-center w-screen'>
                    <div className='h-[7vh] w-[16vw]  bg-blue-900 flex justify-center items-center shadow-md rounded-md'>
    
                        <Link to='/' className='h-[7vh]'>
                            <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{ color: "ffffff"}}/>
    
                        </Link>
                            <h1 className='text-3xl font-mono text-white'>Chat</h1>
    
                    </div>
                </div>
    
               <div className='flex justify-center mt-[2vh] h-[70vh]'> 
                <Card sx={{ width: "70%", height: "100%" }} className='flex'>
                    <div className='w-[20vw] h-full bg-slate-50 drop-shadow-md'>
                        <div className='h-[10vh] shadow-md flex justify-around items-center'>
                            <IconButton onClick={toggleMenu}>
                                {menu ? 
                                <EditOffIcon />
                                :
                                <EditIcon />}
                                </IconButton>
                            <p className='text-xl font-light'>People</p>
                            <div onClick={broAdd} className=" bg-amber-300 h-[5vh] w-[5vh] flex justify-center items-center rounded-md  cursor-pointer hover:bg-amber-400 transition-all duration-100 ease-linear hover:shadow-lg shadow-md" ><AddIcon style={{ color: "#464646" }} /></div>
                        </div>
                        <div className='overflow-auto h-[58vh] flex items-center mt-[1vh] drop-shadow-sm flex-col'>
                            {
                                existingContacts.map(eachExistingContact => {
                                        if(menu) {
                                            return (
                                                <div className='flex items-center h-[12vh] w-[19vw] justify-center p-2 bg-white rounded-xl mt-[1vh] '>
                                                    
                                                    <IconButton onClick={() => deleteUser(eachExistingContact)}><DeleteIcon style={{ color: "#fa4151" }}/></IconButton>
                                                </div>
                                                
                                            )
                                        } else {
                                            return (
                                                <div onClick={() => setSelectedContact(eachExistingContact)} className='cursor-pointer flex items-center h-[12vh] w-[19vw] justify-start p-2 bg-white rounded-xl mt-[1vh] hover:shadow-md'>
                                                    <Avatar
                                                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                                        className=''
                                                        alt=""
                                                        sx={{  }}
                                                    />
                                                    <p className=' text-lg ml-[5vw]'>{eachExistingContact.name}</p>
                                                    
                                                </div>
                                                
                                            )
                                        }
                                    
                                    
                                })
                            }
                        </div>
                    </div>
                    <div className='flex flex-col w-[50vw]'>
                        <div className='h-[60vh] ml-[2vw] w-[45vw] flex flex-col justify-end mb-[2vh]'>
                            {messagesWithContact.map(msg => {
                                    return <Message 
                                        pfp={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                        fromName={msg.data.fromUser.name}
                                        message={msg.data.message}
                                        received={msg.data.toUser.uid == user.uid}
                                    />
                                })}
                        </div>
    
    
                        <div className='h-[10vh]'>
                            <form onSubmit={sendMessage} className='flex items-center ml-[2vw]'>
                                <input
                                    className='w-[40vw] h-[8vh] p-4 border-none outline-none bg-zinc-100 rounded-3xl shadow-md'
                                    type='text'
                                    placeholder='Message'
                                    onChange={(e) => setEnteredMessage(e.target.value)}
                                    value={enteredMessage}
                                />
                                
                                <button className='bg-zinc-500 rounded-3xl transition-all duration-100 ease-linear hover:bg-zinc-700 shadow-md hover:shadow-xl w-[8vh] h-[8vh] ml-[1vw] flex items-center justify-center'><SendIcon style={{ color: "#fff" }}/></button>
                                </form>
                        </div>
                    </div>
                </Card>
            </div>
            
    
                
    
               
               
            </div>
            {
                add == true && (
                    <div className='w-[100vw] h-[100vh] flex justify-center items-center backdrop-blur drop-shadow-md'>
                    <form className='bg-white h-[40vh] w-[30vw] flex flex-col items-center rounded-lg' onSubmit={createNewContact}>
                        <div className='flex justify-center items-center'>
                            <h1 className='text-3xl font-mono mt-[2vh]'>New Contact</h1>
                            <IconButton onClick={broAdd} style={{ position: "absolute", marginLeft: "25%" }}><CancelIcon/></IconButton>
                        </div>
                        <input
                            className='w-[20vw] border-none h-[8vh] outline-none bg-slate-100 rounded-lg p-4 mt-[10vh]'
                            type='text'
                            placeholder='Email'
                            onChange={e => setNewContactEmail(e.target.value)}
                            value={newContactEmail}
                            required
                        />
                        
                        <button className=' bg-slate-100 mt-[3vh] rounded-lg transition-all duration-100 ease-linear hover:bg-slate-200 shadow-md hover:shadow-xl w-[20vw] h-[6vh]'>Create contact</button>
                    </form>
                    </div>
                )
        }
        </>
      )
}

export default Chat