import {
  DownOutlined,
  KeyOutlined,
  LogoutOutlined,
  CloseOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Upload,
  message,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { uploadFile } from "react-s3";
import notfound from "../../assets/images/not_found.png";
import Notification from "../../assets/images/notification.svg";
import DeleteModal from "../../components/DeleteModal";
import { s3Config } from "../../config/s3Config";
import LogoBlack from "../../assets/images/logo-black.png";
import apiPath from "../../constants/apiPath";
import { AuthContext } from "../../context/AuthContext";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import { useNavigate } from "react-router";
import { useAppContext } from "../../context/AppContext";
import moment from "moment";
import SingleImageUpload from "../SingleImageUpload";
const { confirm } = Modal;
const toggler = [
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    key={0}
  >
    <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
  </svg>,
];

const togglerVertical = [
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    key={1}
  >
    <path d="M200 16c-8.8 0-16 7.2-16 16v448c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V32c0-8.8-7.2-16-16-16h-48zm160 0c-8.8 0-16 7.2-16 16v448c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V32c0-8.8-7.2-16-16-16h-48zm-320 0c-8.8 0-16 7.2-16 16v448c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V32c0-8.8-7.2-16-16-16H40z" />
  </svg>,
];

const currency = ["AED", "INR"];

function Header({ name: sectionHeading, onPress, setToggle }) {
  useEffect(() => window.scrollTo(0, 0));
  const [visible, setVisible] = useState(false);
  const [profile, setProfile] = useState({});
  const [selected, setSelected] = useState();
  const [profileVisible, setProfileVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [iconToggle, setIconToggle] = useState(false);
  const [appSetting, setAppSetting] = useState({});
  // const [breadcrumb, setBreadcrumb] = useState(name?.split('/') ?? []);
  const [appSettingSelected, setAppSettingSelected] = useState();
  const [appSettingVisible, setAppSettingVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const { request } = useRequest();
  const [refresh, setRefresh] = useState(false);
  const { logout } = useContext(AuthContext);
  const { setCountry, country } = useAppContext();
  const [emailVisible, setEmailVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState([]);
  const [unread, setUnread] = useState([]);

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    getCountry();
    getNotification();
  }, [refresh]);

  const getCountry = () => {
    request({
      url: `/country`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, "Country");
        if (data) {
          setCountries(data);
          data.length &&
            setCountry((prev) => ({ ...prev, country_id: data[0]._id }));
        }
      },
    });
  };

  const getNotification = () => {
    request({
      url: "/admin/notification/getNotification",
      method: "GET",
      onSuccess: ({ data }) => {
        const unreadNotifications = data.data.filter(
          (notification) => !notification.is_read
        );
        // Store the length of unread notifications in a variable
        const unreadNotificationsLength = unreadNotifications.length;
        setUnread(unreadNotificationsLength);
        const firstFiveNotifications = data.data.slice(0, 5); // Get the first five items
        setNotification(firstFiveNotifications);
        console.log("check data", firstFiveNotifications);
      },
    });
  };

  const onChange = (key, value) => {
    setCountry((prev) => ({ ...prev, [key]: value }));
  };
  const readNotification = (Id) => {
    request({
      url: `/admin/notification/readAll?id=${Id}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        // setList(data?.data)
        // setPagination(prev => ({ current: pagination?.current, total: data?.data?.length }))
      },
      onError: (error) => {
        setLoading(false);
        // ShowToast(error, Severty.ERROR)
      },
    });
    // setList(dummyNotifications);
    setLoading(false);
  };

  const deleteNotification = (Id) => {
    request({
      url: `/admin/notification/deleteAll?id=${Id ? Id : ""}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        // setList(data?.data)
        // setPagination(prev => ({ current: pagination?.current, total: data?.data?.length }))
      },
      onError: (error) => {
        setLoading(false);
        // ShowToast(error, Severty.ERROR)
      },
    });
    // setList(dummyNotifications);
    setLoading(false);
  };

  const notificationitems = [
    {
      label: (
        <div className="notification_top">
          <div className="notification-head">
            <h5>Notifications</h5>
          </div>
          <div className="notification-inner">
        {notification.map((data, index) => {
  const timeInLocal = moment.utc(data?.utc_time, "HH:mm").local();

  return (
    <div className="single-notification" key={index}>
      <div className="notification-img">
        <img src={LogoBlack} alt="Notification" />
      </div>

      <div className="notification-cont">
        <p>
          {data.description
            ?.replace(
              "{{APPOINTMENT_DATE}}",
              moment.parseZone(data?.utc_date).format("DD-MM-YYYY")
            )
            .replace(
              "{{APPOINTMENT_TIME}}",
              timeInLocal.isValid() ? timeInLocal.format("hh:mm A") : "-"
            )}
        </p>

        <p>
          {moment(data.created_at).format("DD-MM-YYYY hh:mm A")}
        </p>
      </div>
    </div>
  );
})}

          </div>

          <div className="viewAll_notification">
            <Button
              onClick={() => {
                getNotification();
                navigate("/notification");
              }}
              className="btnStyle btn_primary"
            >
              View All
            </Button>

            <Button
              onClick={() => deleteNotification()}
              className="btnStyle btn_primary"
            >
              Delete All
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const items = [
    {
      label: "Edit Profile",
      key: "1",
      icon: <UserOutlined />,
      danger: true,
    },
    {
      label: "Change Email",
      key: "2",
      icon: <UserOutlined />,
      danger: true,
    },
    {
      label: "Change Password",
      key: "3",
      icon: <KeyOutlined />,
      danger: true,
    },
    {
      label: "Logout",
      key: "4",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  useEffect(() => {
    if (!isOpen) return document.body.classList.remove("edit-dropdown");
    document.body.classList.add("edit-dropdown");

    return () => {
      document.body.classList.remove("edit-dropdown");
    };
  }, [isOpen]);

  const showDeleteConfirm = (record) => {
    setIsLogoutModalVisible(true);
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    // setTimeout(() => {
    //   confirm({
    //     okText: "Logout",
    //     okType: "danger",
    //     icon: <QuestionCircleFilled />,
    //     cancelText: "Cancel",
    //     content: <Button>Are you sure you want to logout ?</Button>,
    //     onOk() {
    //       logout();
    //     },
    //     onCancel() {
    //       console.log("Cancel");
    //     },
    //   });
    // }, 5);
  };

  const handleMenuClick = (e) => {
    setIsOpen(false);
    if (e.key == 3) {
      setVisible(true);
    }
    if (e.key == 2) {
      console.log("visible>>>>>>>");
      setEmailVisible(true);
    }
    if (e.key == 1) {
      setProfileVisible(true);
    }
    if (e.key == 5) {
      setAppSettingVisible(true);
    }
    if (e.key == 4) {
      showDeleteConfirm();
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleCreate = (values) => {
    onCreate(values);
  };

  const onCreate = (values) => {
    const { old_password, new_password } = values;
    const payload = {};
    if (!old_password || !new_password)
      return ShowToast("Please enter password ", Severty.ERROR);
    setLoading(true);
    payload.new_password = new_password;
    payload.old_password = old_password;
    request({
      url: apiPath.changePassword,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(`Logged Out! ${data.message}`, Severty.SUCCESS);
          setVisible(false);
          logout();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    // setBreadcrumb(sectionHeading?.split("/") ?? []);
  }, [sectionHeading]);

  useEffect(() => {
    request({
      url: apiPath.profile,
      method: "GET",
      onSuccess: (data) => {
        setProfile(data.data);
        setSelected(data.data);
      },
    });
    request({
      url: apiPath.getAppSetting,
      method: "GET",
      onSuccess: (data) => {
        setAppSetting(data.data);
        setAppSettingSelected(data.data);
      },
    });
  }, [refresh]);

  return (
    <>
      <Row gutter={[24, 0]} className="justify-content-between mx-0">
        <Col
          span={24}
          xs={18}
          md={24}
          lg={12}
          sm={5}
          className="SectionMain px-0"
        >
          <div className="toggale-headr">
            <div className="">
              <Button
                type="link"
                className="sidebar-toggler ps-0 d-none d-lg-block"
                onClick={() => {
                  setToggle((prev) => !prev);
                  setIconToggle((prev) => !prev); 
                }}
              >
                {iconToggle ? togglerVertical : toggler}
              </Button>
            </div>
            <div className="d-none d-lg-block">{sectionHeading}</div>
          </div>
          <div className="tabLogo d-sm-block d-lg-none">
            <img className="w-100" src={LogoBlack} />
          </div>
        </Col>
        <Col span={24} xs={24} sm={24} lg={12} className="header-control px-0">
          <Button
            type="link"
            className="sidebar-toggler ps-0"
            onClick={() => onPress()}
          >
            {toggler}
          </Button>

          {/* <div className="country-wrap">
            <span className="country_icon"></span>
            <Select
              value={country?.country_id}
              options={countries.map((item) => ({
                value: item._id,
                label: item.name,
              }))}
              onChange={(value) => onChange("country_id", value)}
            />
          </div> */}

          <div className="notificationDropdownMain">
            <div className="notification-header d-lg-block">
              <Dropdown
                menu={{ items: notificationitems }}
                trigger={["click"]}
                className="notification-box"
              >
                <Button>
                  <img src={Notification} alt="notification" />

                  {unread > 0 && (
                    <span className="active_notification">{unread}</span>
                  )}
                </Button>
              </Dropdown>
            </div>
          </div>
          <div className="profileDropdownMain">
            <Dropdown
              open={isOpen}
              onOpenChange={(open) => setIsOpen(open)}
              className="edit-box"
              menu={menuProps}
              trigger={["click"]}
            >
              <Button className="ant-btn ant-btn-default ant-dropdown-trigger ant-dropdown-open">
                <div className=" d-flex align-items-center gap-2">
                  <div className="userImg">
                    <Image
                      src={profile ? profile.image : notfound}
                      preview={false}
                    />
                    {/* <img src={Avatar} /> */}
                  </div>
                  <div className="d-none d-xl-block">
                    <div className="userName">
                      {profile ? profile?.name : "Administrator"}
                      <DownOutlined />
                    </div>
                  </div>
                </div>
              </Button>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {isLogoutModalVisible && (
        <DeleteModal
          title={"Logout"}
          subtitle={`Are you sure you want to Logout the Application?`}
          show={isLogoutModalVisible}
          hide={() => {
            setIsLogoutModalVisible(false);
          }}
          onOk={() => logout()}
        />
      )}

      {profileVisible && (
        <EditProfile
          show={profileVisible}
          hide={() => {
            setProfileVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {appSettingVisible && (
        <AppSetting
          show={appSettingVisible}
          hide={() => {
            setAppSettingVisible(false);
          }}
          data={appSettingSelected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {emailVisible && (
        <EmailEdit
          show={emailVisible}
          hide={() => {
            setEmailVisible(false);
          }}
        />
      )}

      {visible && (
        <ChangePassword
          show={visible}
          handleCreate={handleCreate}
          hide={() => {
            setVisible(false);
          }}
        />
      )}
    </>
  );
}

const EditProfile = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
    //setFile([data.image]);
    if (data.image != undefined) {
      setImage(data.image);
    } else {
      setImage([notfound]);
    }
  }, [data]);

  const onEditProfile = (values) => {
    const { email, name } = values;
    console.log(file.length <= 0 || !image);
    if (file.length <= 0 && !image)
      return ShowToast("Please select the profile Image ", Severty.ERROR);
    const payload = {};
    setLoading(true);
    payload.email = email;
    payload.name = name;
    payload.image = image;
    request({
      url: apiPath.updateProfile,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      open={show}
      // title={`${data ? "Edit Profile" : ""}`}
      okText="Ok"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Edit Profile</h4>
      <Form id="create" form={form} onFinish={onEditProfile} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please enter the name!" },
                {
                  pattern: new RegExp(/^[a-zA-Z ]*$/),
                  message: "Only Alphabetic Characters Allowed",
                },
              ]}
            >
              <Input placeholder="Enter Name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                { required: true, message: "Please enter the email!" },
              ]}
            >
              <Input placeholder="Enter Email Address" disabled />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              className=""
              label="Upload Profile"
              name="image"
              rules={[
                {
                  required: file.length > 0 ? false : true,
                  message: "Please enter the profile image!",
                },
              ]}
            >
              <SingleImageUpload
                value={image}
                fileType={FileType}
                imageType={"logo"}
                onChange={(data) => setImage(data?.[0]?.url)}
              />
              {/* {console.log(image, "image>>>>>>>>>>>")}
              {image && (
                // <div className="mt-3">
                //   {" "}
                //   <Image width={300} src={image}></Image>{" "}
                // </div>
              )} */}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const EmailEdit = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState([]);
  const { logout } = useContext(AuthContext);

  const [oldMailOtp, setOldMailOtp] = useState();
  const [newMailOtp, setNewMailOtp] = useState();
  const [image, setImage] = useState([]);

  const onEditProfile = (values) => {
    const { email, newEmail, oldEmailOtp, newEmailOtp } = values;
    let payload = {};
    payload.oldEmail = email;
    payload.oldMailOtp = oldEmailOtp;
    payload.newMail = newEmail;
    payload.newMailOtp = newEmailOtp;
    request({
      url: apiPath.changeMail,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        console.log(data, "data>>>>>>>>");
        ShowToast(data.message, Severty.SUCCESS);
        hide();
        logout();
        refresh();
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  const otpVerify = (values) => {
    const { email, newEmail, oldEmailOtp, newEmailOtp } = values;

    if (!newEmailOtp && !oldEmailOtp) {
      handleResetPassword(email);
      handleSendOtp(newEmail);
      setOldMailOtp(email);
      setNewMailOtp(newEmail);
    } else {
      onEditProfile(values);
    }
  };
  const handleResetPassword = (email, setData = true) => {
    let payload = {};
    payload.email = email;
    request({
      url: apiPath.forgotPassword,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        console.log(data, "handle reste passowrd otp modal");
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };
  const handleSendOtp = (email, setData = true) => {
    let payload = {};
    payload.email = email;
    request({
      url: apiPath.sendOTP,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        console.log(data, "handle rest passowrd otp modal");
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };
  return (
    <Modal
      open={show}
      // title={`${data ? "Edit Profile" : ""}`}
      okText="Ok"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Edit Email</h4>
      <Form id="create" form={form} onFinish={otpVerify} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                { required: true, message: "Please enter the email!" },
              ]}
            >
              {oldMailOtp ? (
                <Input value={oldMailOtp} disabled />
              ) : (
                <Input placeholder="Enter Email Address" />
              )}
            </Form.Item>
          </Col>
          {oldMailOtp ? (
            <Form.Item label="Old mail otp" name="oldEmailOtp">
              <Input placeholder="Enter Otp" />
            </Form.Item>
          ) : (
            ""
          )}
          <Col span={24}>
            <Form.Item
              label="New Email Address"
              name="newEmail"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                { required: true, message: "Please enter the email!" },
              ]}
            >
              {newMailOtp ? (
                <Input value={newMailOtp} disabled />
              ) : (
                <Input placeholder="Enter Email Address" />
              )}
            </Form.Item>
          </Col>
          {newMailOtp ? (
            <Form.Item label="New mail otp" name="newEmailOtp">
              <Input placeholder="Enter Otp" />
            </Form.Item>
          ) : (
            ""
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export const AppSetting = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
  }, [data]);

  const onAppSetting = (values) => {
    setLoading(true);
    request({
      url: apiPath.updateAppSetting,
      method: "POST",
      data: values,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      width={1200}
      open={show}
      // title={`${data ? "Update App Setting" : ""}`}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      okText="Ok"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Update App Setting</h4>
      <Form id="create" form={form} onFinish={onAppSetting} layout="vertical">
        <Row gutter={{ xs: [0, 16], md: [16, 0] }}>
          <Col span={24} md={12}>
            <Card title="Android Details">
              <Col span={24}>
                <Form.Item
                  label="App Store URL"
                  name="app_store_url"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the app store URL!",
                    },
                  ]}
                >
                  <Input placeholder="Enter App Store URL" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Version"
                  name="android_version"
                  rules={[
                    { required: true, message: "Please enter the version!" },
                  ]}
                >
                  <Input placeholder="Enter Android Version" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Share Content"
                  name="android_share_content"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the share content!",
                    },
                  ]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={500}
                    style={{ height: 120, marginBottom: 15 }}
                    placeholder="Share Android Content"
                  />
                </Form.Item>
              </Col>
            </Card>
          </Col>

          <Col span={24} md={12}>
            <Card title="IOS Details">
              <Col span={24} className="">
                <Form.Item
                  label="Play Store URL"
                  name="play_store_url"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the play store URL!",
                    },
                  ]}
                >
                  <Input placeholder="Enter Play Store URL" />
                </Form.Item>
              </Col>

              <Col span={24} className="">
                <Form.Item
                  label="Version"
                  name="ios_version"
                  rules={[
                    { required: true, message: "Please enter the version!" },
                  ]}
                >
                  <Input placeholder="Enter IOS Version" />
                </Form.Item>
              </Col>

              <Col span={24} className="">
                <Form.Item
                  label="Share Content"
                  name="ios_share_content"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the share content!",
                    },
                  ]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={500}
                    style={{ height: 120, marginBottom: 15 }}
                    placeholder="Share IOS Content"
                  />
                </Form.Item>
              </Col>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const ChangePassword = ({ show, hide, handleCreate }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={show}
      // title="Change password"
      okText="Ok"
      onCancel={hide}
      //onOk={handleCreate}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        //loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Change Password</h4>
      <Form id="create" form={form} onFinish={handleCreate} layout="vertical">
        <Form.Item
          label="Old Password"
          name="old_password"
          hasFeedback
          rules={[
            { required: true, message: "Please enter the old password!" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="new_password"
          dependencies={["old_password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please enter the new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
        if (!value) {
          return Promise.reject();
        }
        const errors = [];

        if (value.length < 8)
          errors.push("• At least 8 characters");
        if (!/[A-Z]/.test(value))
          errors.push("• Include one uppercase letter");
        if (!/[a-z]/.test(value))
          errors.push("• Include one lowercase letter");
        if (!/[0-9]/.test(value))
          errors.push("• Include one digit");
        if (!/[!@#\\$%\\^&\\*]/.test(value))
          errors.push("• Include one special character");

        if (getFieldValue("old_password") === value) {
          errors.push("• Old password & new password must be different");
        }

        if (errors.length) {
                  return Promise.reject(
            <div>
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirm_new_password"
          dependencies={["new_password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please enter the confirm password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
        if (!value) {
          return Promise.reject();
        }
        const errors = [];
        if (value.length < 8)
          errors.push("• Must Be at least 8 characters");
        if (!/[A-Z]/.test(value))
          errors.push("• Include one uppercase letter");
        if (!/[a-z]/.test(value))
          errors.push("• Include one lowercase letter");
        if (!/[0-9]/.test(value))
          errors.push("• Include one digit");
        if (!/[!@#\\$%\\^&\\*]/.test(value))
          errors.push("• Include one special character");
        if (value && getFieldValue("new_password") !== value) {
          errors.push("• Confirm password & password do not match!");
        }

        if (errors.length) {
                return Promise.reject(
            <div>
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          );
        }

        return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Header;
