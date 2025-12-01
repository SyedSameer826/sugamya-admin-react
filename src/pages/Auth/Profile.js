import React, { useState, useContext, useEffect } from "react";
import { Row, Col, Card, Button, Avatar, Modal, Form, Input, Upload, message, Image } from "antd";
import profilavatar from "../../assets/images/face-1.jpg";
import apiPath from "../../constants/apiPath";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { AuthContext } from "../../context/AuthContext";
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile } from 'react-s3';
import { s3Config } from "../../config/s3Config";
import notfound from "../../assets/images/not_found.png";

function Profile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const { logout } = useContext(AuthContext)
  const [visible, setVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [refresh, setRefresh] = useState(false)
  const [form] = Form.useForm();

  const { request } = useRequest()
  const handleCreate = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onCreate(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  
  const onCreate = (values) => {
    const { old_password, new_password } = values
    const payload = {}
    if (!old_password || !new_password) return ShowToast('Please enter password ', Severty.ERROR)
    setLoading(true)
    payload.new_password = new_password
    payload.old_password = old_password
    request({
      url: apiPath.changePassowrd,
      method: 'POST',
      data: payload,
      onSuccess: (data) => {
        setLoading(false)
        if (data.status) {
          ShowToast(`Logged Out! ${data.message}`, Severty.SUCCESS)
          setVisible(false)

          logout()
        } else {
          ShowToast(data.message, Severty.ERROR)
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR)
        setLoading(false)
      },
    })
  };

  useEffect(() => {
    request({
      url: apiPath.profile,
      method: 'GET',
      onSuccess: (data) => {
        setProfile(data.data)
        setSelected(data.data)
      },
    })
  }, [refresh])
  return (
    <>
      <Card
        className="card-profile-head"
        bodyStyle={{ display: "none" }}
        title={
          <Row justify="space-between" align="middle" gutter={[24]}>
            <Col span={24} md={24}>
              <Avatar.Group>
                <Avatar size={74} shape="square" src={profile ? profile.profilePic : profilavatar} />
                <div className="avatar-info">
                  <h4 className="font-semibold m-0">{profile ? profile.name : ""}</h4>
                  <p>{profile ? profile.email : ""}</p>
                </div>
              </Avatar.Group>
            </Col>
          </Row>
        }
      ></Card>
      <Card className="profile-nav">
        <div className="profile-nav-inner">
          <Button onClick={(e) => setProfileVisible(true)} >Edit Profile</Button>
          <Button onClick={(e) => setVisible(true)} >Change Password</Button>
          <Button onClick={logout} >Logout</Button>
        </div>
      </Card>

      {profileVisible && <EditProfile show={profileVisible} hide={() => { setProfileVisible(false) }} data={selected} refresh={() => setRefresh(prev => !prev)} />}
      <Modal
        visible={visible}
        title="Change password"
        okText="Ok"
        onCancel={() => {
          setVisible(false);
        }}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Old Password"
            name="old_password"
            hasFeedback
            rules={[
              { required: true, message: "Please enter the old password!" }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="new_password"
            hasFeedback
            rules={[
              { required: true, message: "Please enter the new password!" }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirm_new_password"
            dependencies={['new_password']}
            hasFeedback
            rules={[
              { required: true, message: "Please enter the confirm password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>

  );
}

const EditProfile = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest()
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState([]);
  const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"]

  const handleChange = async (event) => {
    const { file } = event
    setFile([file])
    uploadFile(file, s3Config("profile"))
      .then(data => {
        const fileData = {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: data.location,
          thumbUrl: data.location,
        }
        setFile([fileData])
        console.log(data)
      })
      .catch(err => console.error(err))
  };

  const beforeUpload = (file) => {
    if (FileType.includes(file.type)) {
    } else {
        message.error("File format is not correct")
        return false
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
        message.error(`Image must be smaller than 5 MB!`)
        return false
    }
    return true
  }


  useEffect(() => {
    if (!data) return
    form.setFieldsValue({ ...data })
    // setFile([data.image])
    if(data.image != undefined){
      setImage([data.image])
    }else{
      setImage([notfound])
    }
  }, [data])


  const onEditProfile = (values) => {
    const { email, name } = values
    if (file.length <= 0) return ShowToast('Please select the profile Image ', Severty.ERROR)
    const payload = {}
    setLoading(true)
    payload.email = email
    payload.name = name
    payload.profilePic = file.length > 0 ? file[0].url : null
    request({
      url: '/admin/auth/update-profile',
      method: 'POST',
      data: payload,
      onSuccess: (data) => {
        setLoading(false)
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS)
          hide()
          refresh()
          // hide()
        } else {
          ShowToast(data.message, Severty.ERROR)
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR)
        setLoading(false)
      },
    })
  };

  return (
    <Modal
      visible={show}
      title={`${data ? 'Edit Profile' : ''}`}
      okText="Ok"
      onCancel={hide}
      okButtonProps={{
        form: 'create',
        htmlType: 'submit',
        loading: loading,
      }}
    >
      <Form id="create" form={form} onFinish={onEditProfile} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Name"
              name="name" 
              normalize={value => value.trimStart()}
              rules={[
                { required: true, message: "Please enter the name!" },
                { pattern: new RegExp(/^[a-zA-Z ]*$/), message: "Only Alphabetic Characters Allowed" }
              ]}
            >
              <Input autoComplete="off" placeholder="Enter Name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={
                [
                  {
                    type: 'email', message: 'The input is not valid E-mail!',
                  },
                  { required: true, message: "Please enter the email!" }
                ]}
            >

              <Input autoComplete="off" placeholder="Enter Email Address" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={beforeUpload}
              customRequest={handleChange}
              onRemove={(e) => setFile([])}
              fileList={file}
            >
              {file.length > 0 ? null : <Button icon={<UploadOutlined />}>Upload</Button>}

            </Upload>

            <div className="mt-3"> <Image src={image}></Image> </div>

          </Col>
        </Row>

      </Form>
    </Modal>
  )
}

export default Profile;
