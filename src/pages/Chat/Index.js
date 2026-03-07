import { Row, Col, Card, Form, Input, Skeleton } from "antd";
import React, { useState, useEffect, useRef } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import leftArrowIcon from "../../assets/images/leftArrowIcon.svg";
import useFirebase from "../../hooks/useFirebase";
import { useAuthContext } from "../../context/AuthContext";

import {
  getFirestore,
  query,
  doc,
  collection,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { formatDate } from "../../helper/functions";

const Search = Input.Search;

function Index() {
  const { request } = useRequest();
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [selectedInbox, setSelectedInbox] = useState();
  const { userProfile } = useAuthContext();
  const { chatActiveRef } = useFirebase();

  useEffect(() => {
    if (!chatActiveRef) return;
    if (!userProfile) return;

    const q = query(chatActiveRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];

      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      console.log("Subcollection data:", data, selected);
      if (data.length !== 0) {
        if (selected) {
          const user = data.find((item) => item.id == selected);
          if (user) {
            setAllUsers(data);
            return setUsers(data);
          }
        } else {
          if (true) {
            setSelected(data[0].id);
            setSelectedUser(data[0]);
          }
        }
      }
      setUsers(data);
      setAllUsers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatActiveRef, userProfile, selected]);

  const onSearch = (text) => {
    if (!text) return setUsers(allUsers);
    setSearchText(text);
    const filteredArray = users.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setUsers(filteredArray);
  };

  return (
    <>
      <div className="tabled h-100 chatMainwraper">
        <Row gutter={[24, 0]} className="h-100">
          <Col xs={24} className="h-100">
            <Card
              bordered={false}
              className="criclebox tablespace mb-24 h-100"
              title="Message/Chat Manager"
            >
              <div
                className="chatMainOuter d-flex"
                style={{ justifyContent: "start" }}
              >
                <div className="contactOuter usersList h-100 d-flex flex-column flex-nowrap">
                  <div className="contactHeader">
                    <div className="inputGroup">
                      <Search
                        size="large"
                        allowClear
                        placeholder="Search..."
                        onChange={({ target }) => onSearch(target.value)}
                      />
                    </div>
                  </div>
                  <div className="contactBody h-100 flex-fill">
                    {loading
                      ? [1, 2, 3, 4].map((item) => (
                          <Skeleton key={item} active />
                        ))
                      : users?.length
                        ? users.map((user) => (
                            <div
                              key={user.id}
                              className={`contactItem ${selectedInbox === user.id ? "active" : ""} unReadMsg`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                              }}
                              onClick={() => {
                                setSelectedInbox(user?.id);
                              }}
                            >
                              <div className="imgOuter">
                                <img
                                  src={
                                    user.image
                                      ? apiPath.assetURL + user.image
                                      : "https://writestylesonline.com/wp-content/uploads/2018/11/Three-Statistics-That-Will-Make-You-Rethink-Your-Professional-Profile-Picture-1024x1024.jpg"
                                  }
                                />
                              </div>
                              <div className="contactDetail w-100">
                                <div
                                  className=""
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                  }}
                                >
                                  <div className="contactName">{user.name}</div>
                                  <div className="msgTime">09:23 AM</div>
                                </div>
                                {/* <div className="" style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', gap: "12px" }}>
                              <div className="decription">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                              <div className="totalNewMas">3</div>
                            </div> */}
                              </div>
                            </div>
                          ))
                        : null}
                  </div>
                </div>
                {/* Inbox */}
                {selectedInbox && <UserInbox selectedInbox={selectedInbox} />}
                {/* chat detail */}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

const UserInbox = ({ selectedInbox }) => {
  const { request } = useRequest();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const { userProfile } = useAuthContext();
  const { chatActiveRef, chatInboxRef } = useFirebase();
  const [selected, setSelected] = useState();
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    if (!chatInboxRef) return;
    if (!userProfile) return;

    const subCollectionRef = collection(chatInboxRef, `${selectedInbox}`);
    const q = query(subCollectionRef, orderBy("startDate", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      console.log("Subcollection data:", data, selectedInbox);

      if (data.length !== 0) {
        if (selectedInbox) {
          const user = data.find((item) => item.id == selectedInbox);
          if (user) {
            setAllUsers(data);
            return setUsers(data);
          }
        } else {
          if (true) {
            setSelectedUser(data[0]);
          }
        }
      }
      setUsers(data);
      setAllUsers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatInboxRef, userProfile, selectedInbox]);

  const onSearch = (text) => {
    if (!text) return setUsers(allUsers);
    setSearchText(text);
    const filteredArray = users.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setUsers(filteredArray);
  };

  return (
    <>
      <div className="contactOuter h-100 d-flex flex-column flex-nowrap">
        <div className="contactHeader">
          <div className="inputGroup">
            <Search
              size="large"
              allowClear
              placeholder="Search..."
              onChange={({ target }) => onSearch(target.value)}
            />
          </div>
        </div>
        <div className="contactBody h-100 flex-fill">
          {loading
            ? [1, 2, 3, 4].map((item) => <Skeleton key={item} active />)
            : users?.length
              ? users.map((user) => {
                  const isSelected = selectedGroup === user?._id;
                  return (
                    <div
                      key={user.id}
                      // className={`contactItem ${selected === user.id ? "active" : ""} unReadMsg`}
                      className={`users-chat-massage d-flex align-items-center ${
                        isSelected ? "active-chat-user" : ""
                      }`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelected(user?.id);
                        setSelectedGroup(user?.id);
                      }}
                    >
                      <div className="imgOuter">
                        <img
                          src={
                            user.image
                              ? apiPath.assetURL + user.image
                              : "https://writestylesonline.com/wp-content/uploads/2018/11/Three-Statistics-That-Will-Make-You-Rethink-Your-Professional-Profile-Picture-1024x1024.jpg"
                          }
                        />
                      </div>
                      <div className="contactDetail w-100">
                        <div
                          className=""
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div className="contactName">{user.name}</div>
                          <div className="msgTime">09:23 AM</div>
                        </div>
                        {/* <div className="" style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', gap: "12px" }}>
                              <div className="decription">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                              <div className="totalNewMas">3</div>
                            </div> */}
                      </div>
                    </div>
                  );
                })
              : null}
        </div>
      </div>
      {/* chat  detail */}

      {selectedUser && (
        <ChatDetail
          selected={selected}
          selectedInbox={selectedInbox}
          user={selectedUser}
        />
      )}
    </>
  );
};

const ChatDetail = ({ selected, selectedInbox, user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoadind] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState("");
  const [fileUrl, setFileUrl] = useState();
  const [fileType, setFileType] = useState();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isOnline, setIsOnline] = useState();
  const { request } = useRequest();

  const { userProfile } = useAuthContext();
  const { chatListRef, db, chatActiveRef } = useFirebase();

  const scroll = useRef();

  useEffect(() => {
    if (!chatListRef || !selected) return;
    setLoadind(true);
    setIsActive(true);
    const subCollectionRef = collection(
      chatListRef,
      `${selectedInbox}_${selected}`,
    );

    const q = query(subCollectionRef, orderBy("created_at", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() };
        data.push(message);
      });
      console.log("chat data 5:", data);
      setMessages(data);
      scroll?.current?.scrollIntoView({ behavior: "smooth" });
      setUploading(false);
      setLoadind(false);
    });

    return unsubscribe;
  }, [chatListRef, selected, selectedInbox]);

  useEffect(() => {
    if (!selected) return;
    const unsubscribe = onSnapshot(doc(db, "active", `${selected}}`), (doc) => {
      console.log("Current data: ");
      if (doc.data()) {
        const message = { id: doc.id, ...doc.data() };
        console.log(message);
        setIsOnline(message);
      }
    });
    return unsubscribe;
  }, [selected]);

  return (
    <div
      className={`chatingOuter ${isActive ? `active` : ""} h-100 d-flex flex-column flex-nowrap`}
    >
      <div className="chatingHeader">
        <button
          onClick={() => setIsActive(false)}
          type="button"
          class="backArrowBtn"
        >
          <img src={leftArrowIcon} alt="" />
        </button>
        <div className="profileImg">
          <img
            src="https://writestylesonline.com/wp-content/uploads/2018/11/Three-Statistics-That-Will-Make-You-Rethink-Your-Professional-Profile-Picture-1024x1024.jpg"
            alt=""
          />
        </div>
        <div className="detail">
          <div className="name">{user?.name}</div>
          {isOnline ? (
            isOnline.is_online ? (
              <div className="status online">Online</div>
            ) : (
              <div className="status online">
                Last seen {formatDate(isOnline?.last_seen?.toDate())}
              </div>
            )
          ) : (
            <div className="status online">Online</div>
          )}
        </div>
      </div>
      <div className="chatingBody h-100 flex-fill">
        {loading
          ? [1, 2, 3].map((item) => <Skeleton active key={item} />)
          : messages.map((item) => {
              if (item.sender_id === selectedInbox) {
                return <Send data={item} key={item.id} />;
              } else {
                return <Receive data={item} key={item.id} />;
              }
            })}

        {/* <div className="msgDateHistory">26-10-2023</div> */}
      </div>
      <div className="chatingFooter">
        {/* <Form class="" role="search">
          <div class="" style={{ position: "relative" }}>
            <input class="form-control" type="text" placeholder="Type..." />
            <div class="footerBtnGroup d-flex align-items-center position-absolute gap-2">
              <div class="fileUpload">
                <input type="file" class="form-control" style={{ display: "none" }} id="uploadImg" />
                <label for="uploadImg" class="fileAtechLabel d-flex align-items-center justify-content-center">
                  <img src={fileAtechIcon} alt="" />
                </label>
              </div>
              <button type="button" class="btn btnMsgSend">
                <img src={msgSendIcon} alt="" />
              </button>
            </div>
          </div>
        </Form> */}
      </div>
    </div>
  );
};

const Receive = ({ data }) => {
  return (
    <>
      {data.type == "text" ? (
        <div className="msgItem">
          <div className="txt">{data.message}</div>
          <div className="msgTime">
            {formatDate(data?.created_at?.toDate())}
          </div>
        </div>
      ) : (
        <div className="msgItem img">
          <div className="imgMsg">
            <div className="msgImg">
              <img
                src="https://writestylesonline.com/wp-content/uploads/2018/11/Three-Statistics-That-Will-Make-You-Rethink-Your-Professional-Profile-Picture-1024x1024.jpg"
                alt=""
              />
            </div>
            <div className="msgTime">
              {formatDate(data?.created_at?.toDate())}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Send = ({ data }) => {
  return (
    <>
      {
        (data.type = "text" ? (
          <div className="msgItem sent">
            <div className="txt">{data.message}</div>
            <div className="msgTime">
              {formatDate(data?.created_at?.toDate())}
            </div>
          </div>
        ) : (
          <div className="msgItem img sent">
            <div className="imgMsg">
              <div className="msgImg">
                <img
                  src="https://writestylesonline.com/wp-content/uploads/2018/11/Three-Statistics-That-Will-Make-You-Rethink-Your-Professional-Profile-Picture-1024x1024.jpg"
                  alt=""
                />
              </div>
              <div className="msgTime">
                {formatDate(data?.created_at?.toDate())}
              </div>
            </div>
          </div>
        ))
      }
    </>
  );
};

export default Index;
