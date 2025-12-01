import React, { useContext, useEffect, useState } from "react";
import { firebase } from "../../config/firebase";
import { useAuthContext } from "../../context/AuthContext"; // Assuming you have a UserContext to get user data
// import { useHistory } from 'react-router-dom';

const ChatRepository = () => {
  const firestore = firebase.firestore();
  const { userProfile } = useAuthContext();
  const [user, setUser] = useState();

  // const history = useHistory();

  // useEffect(() => {
  //     let data = localStorage.getItem("userProfile");
  //     console.log(data, "\n", userProfile);
  //     setUser(data);
  // }, [userProfile]);

  const createGroup = async (
    groupdId,
    myid,
    oppositeId,
    oppositeUserData,
    quotationData
  ) => {
    console.log(`Group ID Check`, groupdId);

    const isExist = await checkGroupExist(groupdId);
    if (isExist) {
      console.log("Group Already Exists!");
      return;
    }

    // const quotationDataMap = quotationData ? quotationData.toJson() : null;

    firestore
      .collection("groups")
      .doc(groupdId)
      .set({
        last_message: {
          message: "Start Messaging !!",
          time: firebase.firestore.FieldValue.serverTimestamp(),
        },
        isUserReported: false,
        messageCounter: 0,
        isProviderReported: false,
        quotationData: quotationData,
        userData: [
          {
            [myid]: {
              name: localStorage.getItem("userProfile")
                ? JSON.parse(localStorage.getItem("userProfile"))?.name
                : "NA",
              mobile_number: localStorage.getItem("userProfile")
                ? JSON.parse(localStorage.getItem("userProfile"))?.mobile_number
                : "NA",
              unseen_count: 0,
              image: localStorage.getItem("userProfile")
                ? JSON.parse(localStorage.getItem("userProfile"))?.image
                : "https://s3-noi.aces3.ai/sugamaya-bucket/planit/image_1719395118182.png",
            },
            [oppositeId]: {
              name: oppositeUserData?.name || "NA",
              mobile_number: oppositeUserData?.mobileNumber || "NA",
              unseen_count: 0,
              image:
                oppositeUserData?.image ||
                "https://s3-noi.aces3.ai/sugamaya-bucket/planit/image_1719395118182.png",
            },
          },
        ],
        groups: [myid, oppositeId],
      });
  };

  const checkGroupExist = async (docID) => {
    try {
      const documentSnapshot = await firestore
        .collection("groups")
        .doc(docID)
        .get();
      return documentSnapshot.exists;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getAllMyGroups = () => {
    console.log()
    return firestore.collection("adminchat");
  };
  
   const getAllDoctorGroups = () => {
    console.log()
    return firestore.collection("chat");
  };

  const timeAgo = (date) => {
    const diff = Date.now() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffDays > 365) return `${Math.floor(diffDays / 365)} years ago`;
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} months ago`;
    if (diffDays > 7) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays > 0) return `${diffDays} days ago`;
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    if (diffHours > 0) return `${diffHours} hours ago`;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    if (diffMinutes > 0) return `${diffMinutes} minutes ago`;
    return "just now";
  };

  // const getAllMessages = (chatId) => {
  //     return firestore.collection('message')
  // };

  const getAllMessages = (chatId) => {
    return firestore
      .collection("adminchat")
      .doc(chatId)
      .collection("message")
      .orderBy("createdAt", "asc");
  };

  const sendMessage = async (chatModel,groupDid) => {
    console.log(chatModel,"sendMessage------->")
    await firestore.collection("adminchat")
    .doc(groupDid)
    .collection("message")
    .add(chatModel);
  };

  const updateSeenMessages = async (groupDid, myId, message) => {
    try {
      await firestore.runTransaction(async (transaction) => {
        console.log(transaction,"transaction---->")
        const docRef = firestore.collection("adminchat").doc(groupDid);
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new Error("Document does not exist!");
        }

        const data = doc.data();
        if (data.userData) {
          data.userData.forEach((user) => {
            if (user[myId]) {
              user[myId].unseen_count = 0;
            }
          });
        }
        data.messageCounter = data.messageCounter + 1;

        if (message) {
          data.last_message = {
            message: message,
            time: firebase.firestore.FieldValue.serverTimestamp(),
          };
        }

        console.log(groupDid, "\n", myId, "\n", message);

        transaction.update(docRef, data);
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
    }
  };

  const reportUser = async (groupDid, isReport) => {
    try {
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection("groups").doc(groupDid);
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new Error("Document does not exist!");
        }

        transaction.update(docRef, { isProviderReported: isReport });

        // history.goBack();
        alert(
          isReport
            ? "User has been successfully reported & blocked!"
            : "User unblocked successfully. Enjoy chatting!"
        );
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
    }
  };

  const incrementUnseenCount = async (groupDid, myId, message) => {
    try {
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection("groups").doc(groupDid);
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          console.error("Document does not exist!");
          return;
        }

        const data = doc.data();
        if (data.userData) {
          data.userData.forEach((user) => {
            if (user[myId]) {
              user[myId].unseen_count = (user[myId].unseen_count || 0) + 1;
            }
          });
        }

        if (message) {
          data.last_message = {
            message: message,
            time: firebase.firestore.FieldValue.serverTimestamp(),
          };
          data.messageCounter = (data.messageCounter || 0) + 1;
        }

        transaction.update(docRef, data);
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
    }
  };

  const deleteMessages = async (groupId) => {
    try {
      const chatCollection = firestore.collection("adminchat");
      const batch = firestore.batch();
      const querySnapshot = await chatCollection
        .where("groupId", "==", groupId)
        .get();

      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      alert("Chat has been deleted successfully");
    } catch (error) {
      console.error("Error deleting messages: ", error);
    }
  };

  return {
    createGroup,
    checkGroupExist,
    getAllMyGroups,
    timeAgo,
    getAllDoctorGroups,
    getAllMessages,
    sendMessage,
    updateSeenMessages,
    reportUser,
    incrementUnseenCount,
    deleteMessages,
  };
};

export default ChatRepository;
