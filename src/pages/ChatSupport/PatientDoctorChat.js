import React, { useState, useEffect, useRef, useContext } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchImg from "../../assets/images/ion_search-outline.png";
import ProfilepicImg from "../../assets/images/chat-img.png";
import Send1Img from "../../assets/images/send-buaa.png";
import Send133Img from "../../assets/images/john abraham.png";
import pdfIcon from "../../assets/images/pdf-file.png";
import {
  serverTimestamp,
} from "firebase/firestore";
import moment from "moment";
import ChatRepository from "./ChatRepository";
import { AppStateContext } from "../../context/AppContext";

import { Image, Upload, Button } from "antd";
import UploadBtnImg from "../../assets/images/paper-pin.png";
import useRequest from "../../hooks/useRequest";
import { Col } from "antd";
import apiPath from "../../constants/apiPath";
import { firebase } from "../../config/firebase";
import lang from "../../helper/langHelper";

import { Severty, ShowToast } from "../../helper/toast";
const baseUrl = "https://s3-noi.aces3.ai/sugamaya-bucket/"

function Chat() {
  const heading = lang("Patient-Doctor Chat Support");
  const { setPageHeading, country } = useContext(AppStateContext);

  const [selected, setSelected] = useState();
  const [selectedGroup, setSelectedGroup] = useState();

  const [user, setUser] = useState();
  const [doctor, setDoctor] = useState();

  const [groups, setGroups] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const chatRepo = ChatRepository();

  useEffect(() => {
   
    const unsubscribe = chatRepo.getAllDoctorGroups().onSnapshot((snapshot) => {
       const sortedGroups =snapshot.docs.map((doc) => doc.data());
      
      const groupData =  sortedGroups.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
        const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
        return timeB - timeA; // Descending order: newest first
      });
      setGroups(groupData);
      if (groupData?.length && !selected) {
        // const userData = groupData[0]?.userData[0];
        const oppositeUser = groupData[0]?.chatID;
        setUser(groupData[0].patient?.patientID);
        setDoctor(groupData[0].doctor?.doctorID);
        setSelectedGroup(groupData[0]);
        setSelected(oppositeUser);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);     
  return (
    <div className="container">
      <div className="row">
        <Inbox
          groups={groups}
          selected={selected}
          setSelected={val => setSelected(val)}
          setSelectedGroup={val => setSelectedGroup(val)}
          selectedGroup={selectedGroup}
          setUser={setUser}
          setDoctor = {setDoctor}
        />
        <ChatDetails selected={selected}  groups={selectedGroup} refresh={() => setRefresh((prev) => !prev)} />
      </div>
    </div>
  );
}

const Inbox = ({ groups, setSelected,setSelectedGroup,selectedGroup, setUser,setDoctor, selected }) => {
  const [searchTerm, setSearchTerm] = useState("");
 

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
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Update search term as user types
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter((group) => {
    const patientName = group.patient?.patientName?.toLowerCase() || "";
    const doctorName = group.doctor?.doctorName?.toLowerCase() || "";
    const searchLowerCase = searchTerm.toLowerCase();

    // Check if either the doctor's name or patient's name includes the search term
    return (
      patientName.includes(searchLowerCase) ||
      doctorName.includes(searchLowerCase)
    );
  });
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
  {filteredGroups.map((group, index) => {
    const oppositeUser = group.patient;

    // Ensure lastMessage exists before rendering the component
    if (group.lastMessage) {
      const isSelected =  selectedGroup === group;
      return (
        <div
          key={index}
          onClick={() => {
            setUser(oppositeUser);
            setSelected(group.chatID);
            setSelectedGroup(group);
          }}
          className={`users-chat-massage d-flex align-items-center ${
            isSelected ? "active-chat-user" : ""
          }`} 
        >
          <div className="img-chat mr-3">
            <img
              src={
                oppositeUser?.patientImage && oppositeUser?.patientImage === ""
                  ? Send133Img
                  : oppositeUser?.patientImage
                  //+doctor.doctorImage
              }
              alt=""
              className="rounded-circle"
              style={{ width: "50px", height: "50px" }}
            />
          </div>
          <div className="chat-txxt">
            <div className="chat_1-maa d-flex justify-content-between">
              <h2 className="h5 mb-1">Dr. {group.doctor?.doctorName} - {group.patient?.patientName}</h2>
              <p className="text-muted small">
                {moment(group?.lastMmessageTime?.seconds?.toDate()).format(
                  "hh:mm A"
                )}
              </p>
            </div>
            <div className="massage-chat-main">
              <h3 className="small text-muted">{group.lastMessage}</h3>
            </div>
          </div>
        </div>
      );
    }

    return null; // Return null if there's no lastMessage
  })}
</div>

      </div>
    </Col>
  );
};

const ChatDetails = ({ selected, groups, refresh }) => {

  const firestore = firebase.firestore();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRepo = ChatRepository();
  const { request } = useRequest();
  const userId =  groups?.doctor?.doctorID;
  const scroll = useRef();

  useEffect(() => {
    if (!selected) return;

    firestore
      .collection("chat")
      .doc(selected)
      .collection("message")
      .orderBy("createdAt", "asc")
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
       
        setMessages(data);
      })
      .catch((error) => {
      });
  }, [selected, refresh]);

  return (
    <Col span={24} sm={24} lg={18}>
      <div className="chat-box-main_2">
        <div className="main-chat-wtp">
          <div className="chat-day">
            <h2>Today</h2>
          </div>
          {messages.map((message) => {
            <span>{message["id"]}</span>;
           
            if (message?.receiver?.id === userId) {
              return <Receive  data={message} key={message?.id} />;
            }
            return <Send data={message} key={message?.id} />;
          })}
          <span ref={scroll}></span>
        </div>
        {/* <div className="send-msg-button">
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
        </div> */}
      </div>
    </Col>
  );
};

const Send = ({ data }) => {
  return (
    <div class="msg-1">
      {console.log(data, "msg-1 working>>>>>>>")}
      <div class="profile-img">
        <img class=" " src={data?.sender?.userImage ?? Send133Img} alt="" />
      </div>
   <div className="admin-chat" >
   <h2>{data?.sender?.name ?? "Jhon"}</h2>
      {data.messageType == "Text" ? (
        <h3 class="txt">{data?.message}</h3>
      ) : data.messageType == "pdf" ? (
        <a
          href={baseUrl+ data.message}
          target="_blank"
          className="rounded-3 overflow-hidden"
        >
          <img style={{ height: 150 }} src={pdfIcon} alt="" />
        </a>
      ) : data.messageType == "video" ? (
        <video width="320" height="240" controls>
          {" "}
          <source src={baseUrl+ data.message} type="video/mp4" />{" "}
        </video>
      ) : (
        <Image
          src={baseUrl+ data.message}
          alt=""
          style={{ width: "200px", height: "200px", borderRadius: "5px" }}
        />
      )}
      <p>{moment(data?.createdAt?.toDate())?.format("DD-MM-YYYY hh:mm A")}</p>
   </div>
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
        {data.messageType == "Text"?
        ( <h3 class="txt">{data?.message}</h3>
        ) : data.messageType == "pdf" ? (
          <a
            href={baseUrl+ data.message}
            target="_blank"
            className="rounded-3 overflow-hidden"
          >
            <img style={{ height: 150 }} src={pdfIcon} alt="" />
          </a>
        ) : data.messageType == "video" ? (
          <video width="320" height="240" controls>
            {" "}
            <source src={baseUrl+ data.message} type="video/mp4" />{" "}
          </video>
        ) : (
          <Image
            src={baseUrl+ data.message}
            alt=""
            style={{ width: "200px", height: "200px", borderRadius: "5px" }}
          />
        )}
        <p class=" ">{moment(data?.createdAt?.toDate())?.format("DD-MM-YYYY hh:mm A")}</p>
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
