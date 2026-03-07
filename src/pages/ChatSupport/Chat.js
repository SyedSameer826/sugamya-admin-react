import React, { useState, useEffect, useRef, useContext } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchImg from "../../assets/images/ion_search-outline.png";
import ProfilepicImg from "../../assets/images/chat-img.png";
import Send1Img from "../../assets/images/send-buaa.png";
import Send133Img from "../../assets/images/john abraham.png";
import pdfIcon from "../../assets/images/pdf-file.png";
import { serverTimestamp } from "firebase/firestore";
import moment from "moment";
import ChatRepository from "./ChatRepository";
import { AppStateContext } from "../../context/AppContext";

import { Image, Upload, Button, Badge } from "antd";
import UploadBtnImg from "../../assets/images/paper-pin.png";
import useRequest from "../../hooks/useRequest";
import { Col } from "antd";
import apiPath from "../../constants/apiPath";
import { firebase } from "../../config/firebase";
import lang from "../../helper/langHelper";

import { Severty, ShowToast } from "../../helper/toast";
const baseUrl = "https://s3-noi.aces3.ai/sugamaya-bucket/";

function Chat() {
  const heading = lang("Chat Support");
  const { setPageHeading, country } = useContext(AppStateContext);

  const [selected, setSelected] = useState();
  const [user, setUser] = useState();
  const [groups, setGroups] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const chatRepo = ChatRepository();

  useEffect(() => {
    const unsubscribe = chatRepo.getAllMyGroups().onSnapshot((snapshot) => {
      console.log(snapshot, "snapshot of groups");
      const sortedGroups = snapshot.docs.map((doc) => doc.data());
      console.log(sortedGroups, "sortedGroups...........>>>>>>>");

      const groupData = sortedGroups.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
        const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
        return timeB - timeA; // Descending order: newest first
      });

      setGroups(groupData);
      // setGroups(groupData);
      console.log(groupData, "group data>>>>>>>");
      if (groupData?.length && !selected) {
        // const userData = groupData[0]?.userData[0];
        const oppositeUser = groupData[0]?.chatID;
        console.log(groupData[0].user, "::::::::user");
        setUser(groupData[0].user?.userID);
        setSelected(oppositeUser);
      }
    });

    return () => unsubscribe();
  }, [refresh]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);
  return (
    <div className="container">
      <div className="row">
        <Inbox
          groups={groups}
          selected={selected}
          setSelected={setSelected}
          setUser={setUser}
        />
        {selected && (
          <ChatDetails
            selected={selected}
            user={user}
            refresh={() => setRefresh((prev) => !prev)}
          />
        )}
      </div>
    </div>
  );
}

const Inbox = ({ groups, setSelected, setUser, selected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gd, setGd] = useState([]);

  useEffect(() => {
    const sortedGroups = groups.filter((group) => {
      const userName = group.user?.userName?.toLowerCase() || "";
      const searchLowerCase = searchTerm.toLowerCase();
      return userName.includes(searchLowerCase);
    });
    // .sort((a, b) => {
    //   const aTime = a.last_message?.time?.toDate().getTime() || 0;
    //   const bTime = b.last_message?.time?.toDate().getTime() || 0;
    //   return bTime - aTime; // Descending order
    // }
    // );

    setGd(sortedGroups);
    if (sortedGroups.length > 0) {
      const firstGroup = sortedGroups[0];
      setSelectedGroup(firstGroup.chatID);
      setSelected(firstGroup.chatID);
      setUser(firstGroup.user);
    }
  }, [groups, searchTerm, setSelectedGroup, setSelected, setUser]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (groups.length === 0) {
    return (
      <div className="col-md-3">
        <div className="main-chat-div-1">
          <div className="users-chat-massage-maain text-center">
            <img src={ProfilepicImg} alt="" className="rounded-circle" />
            <p>Oops! no Message</p>
            <p>No message in your inbox yet!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Col span={24} sm={24} lg={6}>
      <div className="main-chat-div-1">
        <form className="search-chat d-flex mb-3">
          <button type="submit" className="btn btn-light">
            <img src={SearchImg} alt="" />
          </button>
          <input
            type="text"
            placeholder="Search.."
            name="search"
            className="form-control"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </form>
        <div className="users-chat-massage-maain">
          {gd?.map((group, index) => {
            const oppositeUser = group.user;
            const unReadCount =
              group?.unreadMessages?.[group?.admin?.adminID] || "";
            const isSelected = selectedGroup === group.chatID;
            return (
              <div
                key={index}
                onClick={() => {
                  setUser(oppositeUser);
                  setSelected(group.chatID);
                  setSelectedGroup(group.chatID);
                }}
                className={`users-chat-massage d-flex align-items-center ${
                  isSelected ? "active-chat-user" : ""
                }`}
              >
                <div className="img-chat mr-3">
                  <img
                    src={
                      oppositeUser?.userImage && oppositeUser?.userImage === ""
                        ? Send133Img
                        : oppositeUser?.userImage
                    }
                    alt=""
                    className="rounded-circle"
                    style={{ width: "50px", height: "50px" }}
                  />
                </div>
                <div className="chat-txxt">
                  <div className="chat_1-maa d-flex justify-content-between">
                    <h2 className="h5 mb-1">{group.user?.userName}</h2>
                    <p className="text-muted small">
                      {moment(group?.last_message?.time?.toDate()).format(
                        "hh:mm A",
                      )}
                      {console.log("groupgroup---", group)}
                    </p>
                  </div>
                  <div>{group.user?.uhid || ""}</div>
                  <div
                    className="massage-chat-main "
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 className="small text-muted">
                      {group?.last_message?.message}
                    </h3>
                    {/* <p> */}
                    {/* {unReadCount > 0 && (
                        <span className="unread-count">{unReadCount}</span>
                      )}
                       */}
                    {unReadCount > 0 && (
                      <Badge
                        count={unReadCount}
                        size="small"
                        style={{
                          backgroundColor: "#fb035c",
                          color: "#fff",
                        }}
                      />
                    )}
                    {/* </p> */}
                  </div>
                </div>
              </div>
            );

            return null; // Return null if there's no lastMessage
          })}
        </div>
      </div>
    </Col>
  );
};

const ChatDetails = ({ selected, user, refresh }) => {
  const firestore = firebase.firestore();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRepo = ChatRepository();
  const { request } = useRequest();
  const userId = JSON.parse(localStorage.getItem("userProfile"));
  const scroll = useRef();

  // useEffect(() => {
  //   if (!selected) return;

  //      firestore
  //     .collection("adminchat")
  //     .doc(selected)
  //     .collection("message")
  //     .orderBy("createdAt", "asc")
  //     .get()
  //     .then((querySnapshot) => {
  //       const data = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       console.log(data, "data>>>>>>>>>>>");
  //       // console.log(sortedData, "sortedData>>>>>>")
  //       // Convert nanoseconds to milliseconds
  //       setMessages(data);
  //       scroll?.current?.scrollIntoView({ behavior: "smooth" });
  //     })
  //     .catch((error) => {});

  // }, [selected ,refresh]);

  useEffect(() => {
    if (!selected) return;
    console.log(selected, "My Selected!");
    const unsubscribe = chatRepo
      .getAllMessages(selected)
      .onSnapshot((snapShot) => {
        const data = snapShot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(data);
        scroll?.current?.scrollIntoView({ behavior: "smooth" });
        console.log(data, " messages........");
      });

    return () => unsubscribe();
  }, [selected, refresh]);

  // Automatically scroll to the last message when messages update
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // This will trigger every time messages array changes

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (msg?.trim()) {
      const message = {
        message: msg,
        createdAt: serverTimestamp(),
        senderId: userId?._id,
        chatID: selected,
        messageType: ["png", "jpg", "jpeg", "Document"].some((ext) =>
          msg.includes(ext),
        )
          ? "Image"
          : msg.includes("pdf")
            ? "pdf"
            : msg.includes("mp4")
              ? "video"
              : "Text",
      };
      console.log(user, "user details>>>>>>>>");
      chatRepo.updateSeenMessages(selected, userId, msg);
      chatRepo.sendMessage(message, selected);
      const data = {
        from_id: userId?._id,
        to_id: user?.userID,
        title: "",
        description: `Dear ${user?.userName}, support has sent you a new message.`,
        data: {
          action: "chat",
          type: "null",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          image: null,
          agoraToken: null,
          channelName: null,
          title: "New Message",
          body: `Dear ${user?.userName}, support has sent you a new message.`,
          callerToken: null,
          callType: null,
          senderId: userId?._id,
          receiverId: user?.userID,
        },
      };
      console.log(data, "data to send notification");
      request({
        url: apiPath.common.sendNotification,
        method: "POST",
        data: data,
        onSuccess: (data) => {
          setMsg(data?.data.upload);
          e.target.value = "";
        },
        onError: (err) => {
          console.log(err);
        },
      });
      setMsg("");
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    console.log(e.target.files, "targeted files<<<<<<<,,,");
    const file = e.target.files[0];
    const data = new FormData();
    data.append("image", file);
    const extension = file.name.split(".").pop();
    console.log(extension, "extension>>>");

    if (!["png", "jpg", "jpeg", "pdf", "mp4"].includes(extension)) {
      return ShowToast("You can upload only image", Severty.ERROR);
    }
    request({
      url: apiPath.common.imageUpload,
      header: { contentType: "multipart/form-data" },
      method: "POST",
      data: data,
      onSuccess: (data) => {
        setMsg(data?.data.upload);
        e.target.value = "";
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  return (
    <Col span={24} sm={24} lg={18}>
      <div className="chat-box-main_2">
        <div className="main-chat-wtp">
          <div className="chat-day">
            <h2>Today</h2>
          </div>
          {messages.map((message) => {
            <span>{message["id"]}</span>;
            {
              console.log(message?.senderId, "message id---------");
              console.log(userId._id, "user id-----------");
            }
            if (message?.senderId === userId?._id) {
              return <Send data={message} key={message?.id} />;
            }
            return <Receive user={user} data={message} key={message?.id} />;
          })}
          <span ref={scroll}></span>
        </div>
        <div className="send-msg-button">
          <form onSubmit={handleSendMessage} className="send_massage">
            <div className="message-sending-56ggamain-5">
              <input
                type="file"
                onChange={handleChange}
                id="file-input"
                style={{ display: "none" }}
              />
              <label
                htmlFor="file-input"
                className="file-input-label file-input-labelmain-45"
              >
                <img src={UploadBtnImg} alt="Upload" />
              </label>
            </div>
            <input
              type="text"
              value={msg}
              onChange={({ target }) => setMsg(target.value)}
              placeholder="Type..."
              name="search"
              style={styles.input}
            />
            <button type="submit" className="message-sending-56gga">
              <img src={Send1Img} alt="Send" />
            </button>
          </form>
        </div>
      </div>
    </Col>
  );
};

const Send = ({ data }) => {
  return (
    <div class="msg-1 msg-123">
      {console.log("msg-1 working>>>>>>>")}
      {data.messageType == "Text" ? (
        <h3 class="txt">{data?.message}</h3>
      ) : data.messageType == "pdf" || data.messageType == "Document" ? (
        <a
          href={baseUrl + data.message}
          target="_blank"
          className="rounded-3 overflow-hidden"
        >
          <img style={{ height: 150 }} src={pdfIcon} alt="" />
        </a>
      ) : data.messageType == "video" ? (
        <video width="320" height="240" controls>
          {" "}
          <source src={baseUrl + data.message} type="video/mp4" />{" "}
        </video>
      ) : (
        <Image
          src={baseUrl + data.message}
          alt=""
          style={{ width: "200px", height: "200px", borderRadius: "5px" }}
        />
      )}
      <p>{moment(data?.createdAt?.toDate())?.format("DD-MM-YYYY hh:mm A")}</p>
      {/* <div class="msgTime mt-2 pt-1 float-end ms-3">
        {data?.is_read ? (
          <img
            className="ms-1"
            style={{ width: 15, height: 15 }}
            src="/assets/img/seen.png"
            alt=""
          />
        ) : (
          <img
            className="ms-1"
            style={{ width: 15, height: 15 }}
            src="/assets/img/unseen.png"
            alt=""
          />
        )}
      </div> */}
    </div>
  );
};

const Receive = ({ data, user }) => {
  return (
    <div class="  msg-2  ">
      <div class="profile-img">
        <img class=" " src={data?.sender?.userImage ?? Send133Img} alt="" />
      </div>
      <div class="prof-chat">
        {console.log(data, "receiving message>>>>>>>>>>")}
        <h2>{data?.sender?.name ?? "Jhon"}</h2>
        {/* <p>{data?.messageType}</p>
        <p>{data?.message}</p> */}
        {data.messageType == "Text" ? (
          <h3 class="txt">{data?.message}</h3>
        ) : data.messageType == "pdf" || data.messageType == "Document" ? (
          <a
            href={baseUrl + data.message}
            target="_blank"
            className="rounded-3 overflow-hidden"
          >
            <img style={{ height: 150 }} src={pdfIcon} alt="" />
          </a>
        ) : data.messageType == "video" ? (
          <video width="320" height="240" controls>
            {" "}
            <source src={baseUrl + data.message} type="video/mp4" />{" "}
          </video>
        ) : (
          <Image
            src={baseUrl + data.message}
            alt=""
            style={{ width: "200px", height: "200px", borderRadius: "5px" }}
          />
        )}
        <p class=" ">
          {moment(data?.createdAt?.toDate())?.format("DD-MM-YYYY hh:mm A")}
        </p>
      </div>
    </div>
  );
};

const styles = {
  sendMassageForm: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "20px",
    marginRight: "10px",
  },
  button: {
    border: "none",
    background: "none",
    cursor: "pointer",
  },
};

export default Chat;
