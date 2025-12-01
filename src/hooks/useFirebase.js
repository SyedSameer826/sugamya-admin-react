import { useState, useEffect, useRef, useContext } from "react";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { db, firebase, m_db, m_app } from "../config/firebase";
import { getFirestore, doc, collection, setDoc, updateDoc, getDoc ,serverTimestamp} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from '../context/AuthContext'
import moment from "moment";

const useFirebase = () => {

    const [messaging, setMessaging] = useState()
    const [fcmToken, setFcmToken] = useState();
    const [chatListRef, setChatListRef] = useState()
    const [chatInboxRef, setChatInboxRef] = useState()
    const [chatActiveRef, setChatActiveRef] = useState()
    const [storage, setStorage] = useState()
    const { userProfile } = useContext(AuthContext)

    useEffect(() => {
        try {
            if (messaging) return
            const init = async () => {
                const supported = await isSupported()
                if (supported) {
                    const messaging = getMessaging(m_app);
                    setMessaging(messaging)
                    const token = await requestForToken(messaging)
                    setFcmToken(token)
                }
            }
            init()
        } catch (err) {
            console.log(err, 'messaging');
        }
    }, [messaging])

    useEffect(() => {
        try {
            const chatList = doc(db, 'chat', 'chat_list');
            const chatInbox = doc(db, 'chat', 'inbox');
            const chatActive = collection(db, 'active');
            setChatListRef(chatList)
            setChatInboxRef(chatInbox)
            setChatActiveRef(chatActive)
        } catch (err) {
            console.log(err, 'o');
        }
    }, [])

    useEffect(() => {
        const storage = getStorage();
        setStorage(storage)
    }, [])

    const addChatToInbox = async (recId, senderObj, receiverObj, text) => {
        const userId = userProfile._id;

        const senderRef = doc(collection(db, 'chat', 'inbox', `${userId}`), recId);
        await setDoc(senderRef, {...senderObj,startDate:moment().toDate()});
        console.log("senderRef",senderRef,senderObj);
        //receiver  
        const receiverRef = doc(collection(db, 'chat', 'inbox', `${recId}`), userId);
        await setDoc(receiverRef, {...receiverObj,startDate:moment().toDate()});
        console.log("receiverRef",receiverRef,receiverObj);
        //Update receiver unread count
        const receiverDoc = await getDoc(receiverRef);

        if (receiverDoc.exists()) {
            // const receiverData = receiverDoc.data();

            // const updatedReceiverData = {
            //     ...receiverObj,
            //     last_message: text ?? '',
            //     unread: receiverData?.unread ? receiverData.unread + 1 : 1,
            // };
            // console.log("Document data:", receiverData);
            // console.log("updatedReceiverData data:", updatedReceiverData);
            // await updateDoc(receiverRef, updatedReceiverData);
        } else {
            console.log("No such document!");
        }

        console.log(senderObj, "ADD TO INBOX", receiverDoc);
    };

    const updateActiveStatus = async (is_online=true) => {
        const userId = userProfile._id;
        const timestamp = new Date().getTime();

        const senderObj ={
            image:userProfile.image,
            last_seen:serverTimestamp(),
            name:userProfile.name,
            type:userProfile.type,
            is_online
        }
        const senderRef = doc(collection(db, 'chat', 'active', `${userId}`),  `${userId}`);
        await setDoc(senderRef, senderObj);

        console.log(senderObj, "ADD TO active");
    };

    const markRead = async (recId) => {
        const userId = userProfile._id
        const receiverRef = doc(collection(db, 'chat', 'inbox', `${userId}`), recId);
        const receiverDoc = await getDoc(receiverRef);
        if (receiverDoc.exists()) {
            const receiverData = receiverDoc.data();
            const updatedReceiverData = {
                ...receiverData,
                unread: 0
            };
            await updateDoc(receiverRef, updatedReceiverData);
        }

    }

    const addMessageToChat = async (recId, obj) => {
        const timestamp = new Date().getTime();
        const userId = userProfile._id

        const senderRef = doc(collection(db, 'chat', 'chat_list', `${userId}_${recId}`), timestamp.toString());
        await setDoc(senderRef, obj);


        const receiverRef = doc(collection(db, 'chat', 'chat_list', `${recId}_${userId}`), timestamp.toString());
        await setDoc(receiverRef, obj);

    }

    const requestForToken = (messaging) => {
        if (!messaging) return ''
        return new Promise((resolve, reject) => {
            getToken(messaging, { vapidKey: `BHkmT91oF8SKY2DrNdtZQSsfQIdTAUVPJFZiD1SgzXqE7ImBJZj0z7f7DryHczCoxJ8zJsbTk38DLLQQuetIOzU` })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log('current token for client: ', currentToken);
                        resolve(currentToken)
                    } else {
                        requestPermission()
                        console.log('No registration token available. Request permission to generate one.');
                    }
                })
                .catch((err) => {
                    requestPermission()
                    console.log('An error occurred while retrieving token. ', err);
                });
        })
    }

    function requestPermission() {
        console.log('Requesting permission...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                requestForToken()
            } else {
                console.log('Permission for notifications has been denied');
            }
        });
    }

    const uploadFileToFirestore = async (file) => {

        const timestamp = new Date().getTime();
        const storageRef = ref(storage, `chat_images/${timestamp}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return downloadUrl
    }

    return {
        fcmToken,
        addChatToInbox,
        addMessageToChat,
        markRead,
        chatInboxRef,
        chatListRef,
        chatActiveRef,
        db,
        uploadFileToFirestore,
        updateActiveStatus
    }
}

export default useFirebase