import React, {useState, useEffect} from 'react'
import {db} from './Firebase'
import {collection, addDoc, query, getDocs, orderBy, setDoc, doc, getDoc, updateDoc, arrayUnion} from 'firebase/firestore'
import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'
import Message from './Message'
import { serverTimestamp } from "firebase/firestore";
import Nav from './Nav';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Chat() {
    const user = useSelector(selectUser)
    const [selectedDestUser, setSelectedDestUser] = useState({uid: "new"})
    const [existingContacts, setExistingContacts] = useState([])
    const [newContact, setNewContact] = useState("")
    const [msg, setMsg] = useState("")
    const [listOfMsgsInConvo, setListOfMsgsInConvo] = useState([])

    useEffect(() => {
        const getExistingContactsFromDb = async () => {
            const q = query(collection(db, 'users/'+user.uid+'/contactList'))
            const snap = await getDocs(q)
            snap.forEach((doc) => {
                setExistingContacts(doc.data().contacts)
            })
        }
        getExistingContactsFromDb()
        getConvo()
    }, [selectedDestUser])

    function handleCreateNewContact(e){
        e.preventDefault()
        const sendNewContactToDb = async () => {
            console.log('making new contact')
            //get the new contact's uid with email
            const snap = await getDoc(doc(db, 'userData', newContact.toString()))
            const newContactUserData = snap.data()
            //add new contact's user data to the contactList
            const ref = doc(db, 'users/'+user.uid+'/contactList', 'list')
            await updateDoc(ref, {
                contacts: arrayUnion(newContactUserData)
            })
            setDoc(doc(db, 'users/'+user.uid+'/messages','convoWith'+newContactUserData.uid.toString()), {});
            alert(newContactUserData.name+' was successfully added as a new contact!')
        }
        sendNewContactToDb()

        const sendNewContactToDestUserDb = async () => {
            const snap = await getDoc(doc(db, 'userData', newContact.toString()))
            const newContactUserData = snap.data()
            //add new contact's user data to the contactList
            const ref = doc(db, 'users/'+newContactUserData.uid+'/contactList', 'list')
            await updateDoc(ref, {
                contacts: arrayUnion({
                    name: user.displayName,
                    uid: user.uid
                })
            })        
            setDoc(doc(db, 'users/'+newContactUserData.uid+'/messages','convoWith'+user.uid.toString()), {});    
        }
        sendNewContactToDestUserDb()
        setNewContact('')
    }

    function handleMsgSubmitToExistingContact(e){
        e.preventDefault()
        console.log('msg sending to existing contact')

        //add msg to this user's db
        const recordMsgInUserSentMsgs = async () => {

            await addDoc(collection(db, 'users/'+user.uid+'/messages/convoWith'+selectedDestUser.uid.toString()+'/_collection'), {
                from: {
                    uid: user.uid,
                    name: user.displayName,
                },
                to: selectedDestUser,
                message: msg,
                timestamp: serverTimestamp()
            })
        }
        recordMsgInUserSentMsgs()
        //add msg to other user's db
        const recordMsgInDestUserReceivedMsgs = async() => {
            await addDoc(collection(db, "users/"+selectedDestUser.uid.toString()+'/messages/convoWith'+user.uid.toString()+'/_collection'), {
                from: {
                    uid: user.uid,
                    name: user.displayName,
                },
                to: selectedDestUser,
                message: msg,
                timestamp: serverTimestamp()
            })
        }
        recordMsgInDestUserReceivedMsgs()
        setMsg('')
        getConvo()
    }

    function getConvo(){
        const readMsgs = async() => {
            let msgData = []
            //query for messages to other user
            const q = query(collection(db, 'users/'+user.uid+'/messages/convoWith'+selectedDestUser.uid.toString()+'/_collection'), orderBy('timestamp', 'asc'))
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach((doc) => {
                msgData.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            
            setListOfMsgsInConvo(msgData)
        }
        readMsgs()
    }

    function renderAllMessagesInConvo(){
        return (
            listOfMsgsInConvo.map(singleMsg => {
                return <Message
                    pfp = {"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    fromName = {singleMsg.data.from.name}
                    message = {singleMsg.data.message}
                />
            })
        )
    }

    return (
        <div>
            <Nav />
            <div className='h-[10vh] flex flex-col justify-center items-center w-screen'>
                <div className='h-[7vh] w-[16vw]  bg-yellow-500 flex justify-center items-center shadow-md rounded-md'>

                    <Link to='/' className='h-[7vh]'>
                        <ArrowBackIcon className='mr-[1vw]' sx={{ height: "100%" }} style={{}}/>

                    </Link>
                        <h1 className='text-3xl font-mono'>Chat</h1>

                </div>
            </div>

            <button onClick={() => setSelectedDestUser({uid: "new"})}>New Contact</button>
            <br />
            {
                existingContacts.map(contact => {
                    return (
                        <div>
                            <button onClick={() => setSelectedDestUser(contact)}>{contact.name}</button>
                            <br />
                        </div>
                    )
                })
            }
            <br />
            <br />

            {
                selectedDestUser.uid === "new" ? (
                    <form onSubmit={handleCreateNewContact}>
                        <input
                            type="text"
                            placeholder='To email'
                            onChange={e => setNewContact(e.target.value)}
                            value={newContact}
                            required
                        />
                        <br />
                        <button>Create Contact</button>
                    </form>
                ) : (
                    <div>
                        <form onSubmit={handleMsgSubmitToExistingContact}>
                            <input
                                type="text"
                                placeholder='Message'
                                onChange={e => setMsg(e.target.value)}
                                value={msg}
                                required
                            />
                            <br />
                            <button>Send</button>
                        </form>
                        <br />
                        {renderAllMessagesInConvo()}
                    </div>
                )
            }
        </div>
    )
}

export default Chat