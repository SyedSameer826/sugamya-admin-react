import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  Modal,
  Select,
  Checkbox,
} from "antd";
import signinLogo from "../../assets/images/wall-logo.svg";
import signinbg from "../../assets/images/Content.png";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import apiPath from "../../constants/apiPath";
import encryptDecrypt from "../../helper/encryptDecrypt";
const { Title } = Typography;
const { Content } = Layout;

const SignIn = () => {
  const { setIsLoggedIn, setUserProfile } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { request } = useRequest();
  const [visible, setVisible] = useState(false);
  const [otpLoginModal, setLoginOtpModal] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [isForget, setIsForget] = useState(false);
  const [selected, setSelected] = useState();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  const handleRememberMeChange = (checked) => {
    console.log(checked, "handleRememberMeChange");
    setRememberMe(checked);
  };
  const onFinish = (values) => {
    const { email, password } = values;
    console.log(email, password);
    setLoginData({ email, password });
    const payload = {email, password}
    request({
      url: apiPath.beforeLogin,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        console.log(data, "fghdjh data");
        if (data.status) {
          newImplemnet(values);
        }
      },
      onError: (error) =>{
        ShowToast(error?.response?.data?.message, Severty.ERROR);
      }
    })
    // onSubmit(values);
  };
  const onSubmit = (values) => {
    const { email, password } = loginData;

    // const { email, password } = values;

    if (!email)
      return ShowToast("Please enter email to sign in", Severty.ERROR);

    const payload = { password };
    if (!password)
      return ShowToast("Please enter valid password ", Severty.ERROR);

    console.log(payload, "fkjdhkd");
    setLoading(true);
    payload.email = email;
    payload.type = "Admin";
    request({
      url: apiPath.login,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        console.log(data, "fghdjh data");
        if (data.status) {
          setIsLoggedIn(true);
          if (rememberMe) {
            var emailEncrypt = btoa(email);
            var passwordEncrypt = btoa(password);
            localStorage.setItem("rememberMe", true);
            localStorage.setItem("ykmCe2AYEFTHobn", emailEncrypt);
            localStorage.setItem("ouUsippetc8S4Ry", passwordEncrypt);
          } else {
            localStorage.removeItem("ykmCe2AYEFTHobn");
            localStorage.removeItem("ouUsippetc8S4Ry");
            localStorage.removeItem("rememberMe");
          }
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("userProfile", JSON.stringify(data.data.user));

          ShowToast(data.message, Severty.SUCCESS);
          setUserProfile(data.data.user);
          setTimeout(() => navigate("/dashboard"), 200);
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
  const newImplemnet = (values) => {
    let payload = {};
    payload["email"] = values.email;
    handleResetPassword(payload, false); // <--- Pass email directly
    // setLoginOtpModal(true);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleForgotPassword = () => {
    setVisible(true);
    setIsForget(true);
  };

  const handleResetPassword = (email, setData = true) => {
    if (email && setData) {
      setLoginData(email);
    }
    setResetLoading(true);

    let payload = {};
    payload.email = email.email;
    request({
      url: apiPath.forgotPassword,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setResetLoading(false);
        ShowToast(data.message, Severty.SUCCESS);
        // setVisible(false);
        console.log(otpLoginModal, "handle reste passowrd otp modal", otpModal);
        if (!otpLoginModal) {
          setOtpModal(true);
        }
        setSelected({ email });
      },
      onError: (error) => {
        setResetLoading(false);
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };

  const handleVerifyOTP = (values) => {
    const { otp } = values;
    setVerifyLoading(true);
    // Verify the OTP entered by the user
    let payload = {};
    payload.email = loginData.email;
    payload.otp = otp;
    request({
      url: apiPath.verifyOTP,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setVerifyLoading(false);
        ShowToast(data.message, Severty.SUCCESS);
        setSelected(null);
        setVisible(false);
        console.log("loginOtp Modal", otpLoginModal, "otpmodal", otpModal);
        if (isForget) {
          setResetModal(true);
          setOtpModal(false);
        } else {
          console.log("its come here ::::::::::::::::");
          onSubmit();
        }
      },
      onError: (error) => {
        setVerifyLoading(false);
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };
  const handleReset = (values) => {
    const { newPassword } = values;
    setPasswordLoading(true);
    // Reset the password with the new password entered by the user
    let payload = {};

    payload.email = loginData.email;
    payload.password = newPassword;
    request({
      url: apiPath.resetPassword,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setPasswordLoading(false);
        setIsForget(false);
        ShowToast(data.message, Severty.SUCCESS);
        setResetModal(false);
      },
      onError: (error) => {
        setPasswordLoading(false);
        setIsForget(false);
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };
  const handleCancelReset = () => {
    setResetModal(false);
    // form.resetFields()
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("ykmCe2AYEFTHobn");
    const savedPassword = localStorage.getItem("ouUsippetc8S4Ry");
    if (savedEmail && savedPassword) {
      setRememberMe(true);
      var originalEmail = atob(savedEmail);
      var originalPassword = atob(savedPassword);
      form.setFieldsValue({ email: originalEmail, password: originalPassword });
    } else {
      setRememberMe(false);
    }
  }, []);
  useEffect(() => {
  if(localStorage.getItem("token")){
    navigate("/dashboard")
  }
  }, [navigate]);

  return (
    <>
      <Layout className="layout-default layout-signin">
        <Content className="signin">
          <Row className="signin-box-row-ujhg" >
           
            <Col span={24} md={24}>
              <div className="signin-box">
                <div className="signup-logo">
                  <img src={signinLogo} alt="" />
                </div>
                <Row justify="space-around">
                  <Col xs={{ span: 24 }} lg={{ span: 24 }} md={{ span: 24 }}>
                    <div className="signup-form">
                      <Title className="mb-15">Login to Admin Portal</Title>
                     
                      <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        className="row-col"
                      >
                        {/* <Form.Item label={"Login As"}>
                          <Select
                            defaultValue="Admin"
                            options={[
                              { value: "Admin", label: "Admin" },
                              // { value: "Vendor", label: "Vendor" },
                              { value: "Super Admin", label: "Super Admin" },
                            ]}
                          />
                        </Form.Item> */}
                        <Form.Item
                          className="username"
                          label="Email Address"
                          name="email"
                          rules={[
                            {
                              type: "email",
                              message: "Please enter a valid email address!",
                            },
                            {
                              max: 255,
                              message:
                                "Email address not more then 255 characters!",
                            },
                            {
                              required: true,
                              message: "Please enter your email!",
                            },
                          ]}
                        >
                          <Input placeholder="Enter Email Address" />
                        </Form.Item>
                        <Form.Item
                          className="password"
                          label="Password"
                          name="password"
                          rules={[
                            {
                              max: 255,
                              message:
                                "Password should contain more then 255 characters!",
                            },
                            {
                              required: true,
                              message: "Please enter your password!",
                            },
                          ]}
                        >
                          <Input.Password
                            onCut={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                            autoComplete="off"
                            placeholder="Enter Password"
                          />
                        </Form.Item>
                        <div className="forgot-pass">
                          <Form.Item
                            name="remember"
                            className="aligin-center"
                            valuePropName={rememberMe}
                          >
                            <Checkbox
                              checked={rememberMe}
                              onChange={(checked) =>
                                setRememberMe(checked.target.checked)
                              }
                            >
                              Remember me
                            </Checkbox>
                          </Form.Item>
                          <Form.Item
                            name="remember"
                            className="aligin-center"
                            valuePropName="checked"
                          >
                            <span onClick={() => handleForgotPassword(form)}>
                              <a>Forgot Password?</a>
                            </span>
                          </Form.Item>
                        </div>
                        <Form.Item>
                          <Button
                            className="float-right"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                          >
                            Login
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Content>

        {visible ? (
          <Modal
            visible={visible}
            // title="Forgot Password"
            okText="Send OTP"
            onCancel={() => {
              setVisible(false);
              // form.resetFields()
            }}
            className="tab_modal"
            okButtonProps={{
              form: "forget-pasword",
              htmlType: "submit",
              loading: resetLoading,
            }}
          >
            <h4 className="modal_title_cls">Forgot Password</h4>
            <Form
              id="forget-pasword"
              onFinish={handleResetPassword}
              layout="vertical"
            >
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                  {
                    max: 255,
                    message: "Email address not more then 255 characters!",
                  },
                  {
                    required: true,
                    message: "Please enter your email!",
                  },
                ]}
              >
                <Input autoComplete="off" placeholder="Enter Email Address" />
              </Form.Item>
            </Form>
          </Modal>
        ) : null}
        {console.log(otpLoginModal, "jdnhjsfjsf>>>>>>>>>>>>", otpModal)}
        {otpModal || otpLoginModal ? (
          <Modal
            open={otpModal || otpLoginModal}
            // title="Verify OTP"
            okText="Verify"
            onCancel={(e) => {
              setOtpModal(false);
              setLoginOtpModal(false);
              // form.resetFields()
            }}
            className="tab_modal"
            okButtonProps={{
              form: "verify-otp",
              htmlType: "submit",
              loading: verifyLoading,
            }}
          >
            <h4 className="modal_title_cls">Verify OTP</h4>
            <Form
              id="verify-otp"
              onFinish={(e) => handleVerifyOTP(e)}
              layout="vertical"
            >
              <Form.Item
                label="OTP"
                name="otp"
                rules={[
                  {
                    required: true,
                    message: "Please enter the OTP",
                  },
                  {
                    len: 5,
                    message: "OTP must be 5 digits",
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  type="number"
                  maxLength={5}
                  placeholder="Enter OTP"
                />
              </Form.Item>
            </Form>
          </Modal>
        ) : null}

        {resetModal ? (
          <Modal
            visible={resetModal}
            // title="Reset Password"
            okText="Update Password"
            onCancel={handleCancelReset}
            okButtonProps={{
              form: "reset-password",
              htmlType: "submit",
              loading: passwordLoading,
            }}
            className="tab_modal"
          >
            <h4 className="modal_title_cls">Reset Password</h4>
            <Form
              id="reset-password"
              onFinish={(e) => handleReset(e)}
              layout="vertical"
            >
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Please enter your new password!",
                  },
                  {
                    pattern: new RegExp(
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/
                    ),
                    message:
                      "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one digit, and one special character.",
                  },
                ]}
              >
                <Input.Password placeholder="Enter New Password" />
              </Form.Item>
              <Form.Item
                label="Confirm New Password"
                name="confirm_new_password"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please enter the confirm password!",
                  },
                  {
                    pattern: new RegExp(
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/
                    ),
                    message:
                      "Confirm password must be at least 8 characters and include one uppercase letter, one lowercase letter, one digit, and one special character.",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Password that you entered doesn't match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Enter Confirm Password" />
              </Form.Item>
            </Form>
          </Modal>
        ) : null}
      </Layout>
    </>
  );
};

export default SignIn;
