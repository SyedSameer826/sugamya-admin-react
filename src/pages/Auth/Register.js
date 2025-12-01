import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Layout,
  Row,
  Space,
  Switch,
  TimePicker,
} from "antd";
import * as _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";

import signinLogo from "../../assets/images/Logo.png";
import {
  PhoneNumberField,
  SelectInput,
  TextInputBox,
} from "../../components/InputField";
import SingleImageUpload from "../../components/SingleImageUpload";
import apiPath from "../../constants/apiPath";
import useRequest from "../../hooks/useRequest";
import LocationMap from "../User/LocationMap";
import { Severty, ShowToast } from "../../helper/toast";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";

const { Header, Content } = Layout;

const foodCategoryList = [
  { name: "Pizza", _id: "Pizza" },
  { name: "burger", _id: "burger" },
  { name: "italian", _id: "italian" },
];

const restaurantCategoryList = [
  { name: "Mexican", _id: "Mexican" },
  { name: "Italian", _id: "Italian" },
  { name: "Chinese", _id: "Chinese" },
];

const dummyDeliveryType = [
  { name: "Delivery", _id: "Delivery" },
  { name: "Pickup", _id: "Pickup" },
];

const weekdays = [
  { name: 'sunday', label: 'S' },
  { name: 'monday', label: 'M' },
  { name: 'tuesday', label: 'T' },
  { name: 'wednesday', label: 'W' },
  { name: 'thursday', label: 'Th' },
  { name: 'friday', label: 'F' },
  { name: 'saturday', label: 'ST' },
]
const FileType = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  // "image/avif",
  // "image/webp",
  // "image/gif",
];
const dummyCountries = [
  { name: "US", _id: "1" },
  { name: "India", _id: "2" },
  { name: "Canada", _id: "3" },
  { name: "Dubai", _id: "4" },
];

const Register = () => {
  const { setIsLoggedIn, setUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const api = {
    signUp: apiPath.signUp,
    country: apiPath.common.countries,
    city: apiPath.common.city,
    fc: apiPath.common.foodCategories,
    rc: apiPath.common.restaurantCategories,
  };

  const [logo, setLogo] = useState();
  const [document, setDocument] = useState();

  const [image, setImage] = useState();

  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [latLong, setlatLong] = useState({ lat: 30.5595, lng: 22.9375 });
  const [location, setLocation] = useState();

 
  const [foodCategories, setFoodCategories] = useState([]);
  const [restaurantCategories, setRestaurantCategories] = useState([]);

  const [userAddress, setUserAddress] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [secondaryMobile, setSecondaryMobile] = useState(null);

  const [selectedTime, setSelectedTime] = useState({
    open: null,
    close: null,
  });

  const { request } = useRequest();

  const onFinish = (values) => {
    console.log(values, "hfjhdkghkhdgkd");
    const { location } = values
    let payload = {
      ...values,
      image: image,
      logo: logo,
      ...mobileNumber,
      ...location,
      document:document
    };
    console.log(payload, "payload");
    register(payload);
  };

  useEffect(() => {
    console.log(selectedTime, "selectedTime");
  }, [selectedTime]);

  const register = (payload) => {
    request({
      url: api.signUp,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        console.log(data, "fghdjh data");
        if (data.status) {
          setIsLoggedIn(true);
          // if (rememberMe) {
          //   // Store the login state in local storage
          //   var emailEncrypt = encryptDecrypt.encryptEmail(values.email);
          //   var passwordEncrypt = encryptDecrypt.encryptPassword(
          //     values.password,
          //   );
          //   localStorage.setItem("rememberMe", "true");
          //   localStorage.setItem("ykmCe2AYEFTHobn", emailEncrypt);
          //   localStorage.setItem("ouUsippetc8S4Ry", passwordEncrypt);
          // } else {
          localStorage.removeItem("ykmCe2AYEFTHobn");
          localStorage.removeItem("ouUsippetc8S4Ry");
          // }
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

  const onFinishFailed = () => { };

  const getCountry = () => {

    request({
      url: `/country`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, 'Country');
        if (data) {
          setCountries(data);
        }
      },
    });
  };

  const getCities = (id) => {
    request({
      url: `/country-city/${id}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, 'setCities');
        if (data) {
          setCities(data);
        }
      },
    });
  };

  const getCategory = () => {
    request({
      url: api.rc,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setRestaurantCategories(data); // TODO: change dummy
        }
        console.log(data, "data");
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getFoodCategory = () => {
    request({
      url: api.fc,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setFoodCategories(foodCategoryList); // TODO: change dummy
        }
        console.log(data, "data");
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const handleUploadLogo = (data) => {
    setLogo(data[0]?.url);
  };

  const handleUploadDocument = (data) => {
    setDocument(data[0]?.url);
  };

  const handleMobileNumberChange = (value, data, type) => {
  
    let country_code = data?.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data?.dialCode?.length),
    });

  };

  const handleUploadRestaurantImage = (data) => {
    if (data && data.length > 0) {
      const images = _.map(data, (item) => {
        return item.url;
      });
      setImage(images);
    } else setImage(null);
  };


  useEffect(() => {
    getCountry();
    getCities();
    getCategory();
    getFoodCategory();
  }, []);

  const handleLocationChange = (value) => {
    setUserAddress(value.address);
    setlatLong({
      lat: parseFloat(value.latitude),
      lng: parseFloat(value.longitude),
    });
  };

  return (
    <div className="sign-up-bg">
      <Layout className="signup-page">
        <div className="sign-up-header">
          <div className="signin_img">
            <img src={signinLogo} />
          </div>
          <h3>Create Your Account</h3>
        </div>
        <Content>
          <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            className="row-col"
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  label="Auto Accept Orders"
                  name="auto_accept_order"
                  className="auto_accept_order"
                //valuePropName="checked"
                >
                  <Switch defaultChecked={false}/>
                  {/* <span className="toggle_title">Auto Accept Orders</span> */}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col md={24} lg={15} className="padding-cls">
                <Card>
                  <Row gutter={20}>
                    <SelectInput
                      name="category_id"
                      label="Restaurant Category"
                      placeholder="Select Category"
                      options={restaurantCategories}
                      rules={[
                        { required: true, message: "Missing Type Selection" },
                      ]}
                    />

                    <Col md={12}>
                      <Form.Item
                        className="mb-0"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (value !== undefined && value?.length > 0) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Logo is required"),
                              );
                            },
                          },
                        ]}
                        label="Upload Logo"
                        name="logo"
                        placeholder="Upload Logo"
                      >
                        <SingleImageUpload
                          value={logo}
                          fileType={FileType}
                          imageType={"logo"}
                          onChange={(data) => handleUploadLogo(data)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={20}>
                    <Col md={12}>
                      <Form.Item
                        className="mb-0"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (value !== undefined && value?.length > 0) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Image is required"),
                              );
                            },
                          },
                        ]}
                        label="Upload Image"
                        name="image"
                        placeholder="Upload Logo"
                      >
                        <SingleImageUpload
                          value={image}
                          fileType={FileType}
                          imageType="image"
                          onChange={(data) => handleUploadRestaurantImage(data)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card>
                  <Row gutter={20}>
                    <TextInputBox
                      name="name"
                      label="Restaurant’s Name"
                      placeholder="Enter Restaurant Name"
                      rules={[
                        {
                          max: 250,
                          message:
                            "Name should contain more then 250 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Name",
                        },
                      ]}
                    />

                    <TextInputBox
                      name="ar_name"
                      label="Restaurant’s Name Arabic"
                      placeholder="Enter Restaurant Name"
                      rules={[
                        {
                          max: 250,
                          message:
                            "Name should contain more then 250 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Name",
                        },
                      ]}
                    />
                  </Row>
                  <Row gutter={20}>
                    <TextInputBox
                      name="description"
                      label="Restaurant Description"
                      placeholder="Enter Restaurant Description"
                      rules={[
                        {
                          max: 500,
                          message:
                            "Description should contain more then 500 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Description",
                        },
                      ]}
                    />
                    <TextInputBox
                      name="ar_description"
                      label="Restaurant Description Arabic"
                      placeholder="Enter Restaurant Description"
                      rules={[
                        {
                          max: 500,
                          message:
                            "Description should contain more then 500 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Description",
                        },
                      ]}
                    />
                  </Row>
                  <Row gutter={20}>
                    <Col span={24} md={12}>
                      <Form.Item className="checkBox_wrap" label="Working Days" name="working_days">

                        <Checkbox.Group onChange={(value) => console.log(value, 'working')}>
                          {
                            weekdays.map((item, idx) => <Checkbox value={item.name} key={idx} > {item.label} </Checkbox>)
                          }

                        </Checkbox.Group>

                      </Form.Item>
                    </Col>
                    <Col span={24} md={12}>
                      <Row gutter={20}>
                        <Col span={24} md={12}>
                          <Form.Item label="Open Time" name="open_time"
                            rules={[
                              {
                                required: true,
                                message: "Please select open time",
                              }]}
                          >
                            <TimePicker
                              format="HH:mm A"
                              use12Hours
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24} md={12}>
                          <Form.Item
                            label="Close Time"
                            name="close_time"
                            rules={[
                              {
                                required: true,
                                message: "Please select close time",
                              }]}
                          >
                            <TimePicker
                              format="HH:mm A"
                              use12Hours
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>

                <Card>
                  <Row gutter={20}>
                    <SelectInput
                      name="country_id"
                      label="Country"
                      placeholder="Select country"
                      options={countries}
                      onChange={value => getCities(value)}
                      cover={{ md: 7 }}
                      rules={[
                        { required: true, message: "Missing Type Selection" },
                      ]}
                    />
                    <SelectInput
                      name="city_id"
                      label="City"
                      placeholder="Select City"
                      options={cities}
                      cover={{ md: 5 }}
                      rules={[
                        { required: true, message: "Missing Type Selection" },
                      ]}
                    />

                    <TextInputBox
                      name="area"
                      label="Area"
                      placeholder="Enter Area"
                      rules={[
                        {
                          max: 20,
                          message:
                            "Area should contain more then 20 characters!",
                        },

                      ]}
                    />
                    {/* <SelectInput
                      name="area"
                      label="Area"
                      placeholder="Enter Area"
                      options={cities} //TODO:  change to area
                      cover={{ md: 12 }}
                      rules={[
                        { required: true, message: "Missing Type Selection" },
                      ]}
                    /> */}
                  </Row>
                  <Row gutter={20}>
                    <TextInputBox
                      name="address"
                      label="Address"
                      placeholder="Enter Address"
                      rules={[
                        {
                          max: 600,
                          message:
                            "Name should contain more then 600 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Name",
                        },
                      ]}
                    />
                    <TextInputBox
                      name="ar_address"
                      label="Address Arabic"
                      placeholder="Enter Address"
                      rules={[
                        {
                          max: 600,
                          message:
                            "Name should contain more then 600 characters!",
                        },
                        {
                          required: true,
                          message: "Please Enter Restaurant Name",
                        },
                      ]}
                    />
                  </Row>
                </Card>
                <Row gutter={20}>
                  <Col md={12}>
                    <Card>
                      <Row>
                        <TextInputBox
                          name="contact_person_name"
                          label="Contact Person Name"
                          placeholder="Enter Contact Person Name"
                          cover={{ md: 24 }}
                          rules={[
                            {
                              max: 250,
                              message:
                                "Name should contain more then 250 characters!",
                            },
                            {
                              required: true,
                              message: "Please Enter Restaurant Name",
                            },
                          ]}
                        />
                      </Row>
                      <Row>
                        <Col md={24}>
                          <Form.Item
                            label="Email ID"
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
                                message: "Please enter email!",
                              },
                            ]}
                          >
                            <Input placeholder="Enter Email ID" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>

                        <PhoneNumberField
                          label="Contact Person Phone Number"
                          name="mobile"
                          placeholder="Enter Phone Number"
                          cover={{ md: 24 }}
                          className=""
                          onChange={handleMobileNumberChange}
                        />


                      </Row>
                      {/* <Row>
                        <PhoneNumberField
                          label="Contact Person Phone Number2"
                          name="mobile_secondary"
                          placeholder="Enter Phone Number"
                          cover={{ md: 24 }}
                          className=""
                          onChange={(e) => {
                            handleMobileNumberChange(e, "secondary");
                          }}
                        />
                      </Row> */}
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card>
                      <Row>
                        <Col md={24}>
                          <Form.Item
                            label="Create Password"
                            name="password"
                            rules={[
                              {
                                pattern: new RegExp(
                                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
                                ),
                                message:
                                  "Confirm password at least contain 8 characters, at least contain one captital letter, at least contain one small letter, atleast contain one digit, atleast contain one special character",
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
                              placeholder="Create Password"
                            />
                          </Form.Item>
                        </Col>

                        <Col md={24}>
                          <Form.Item
                            label="Confirm Password"
                            name="confirm_password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                              {
                                required: true,
                                message: "Enter the confirm password!",
                              },

                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    getFieldValue("password") === value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(
                                    new Error(
                                      "Password that you entered doesn't match!",
                                    ),
                                  );
                                },
                              }),
                            ]}
                          >
                            <Input.Password placeholder="Enter Confirm Password" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={24}>
                          <Form.Item
                            label="Risk of Waste"
                            name="is_waste_risk"
                            className="auto_accept_order"
                          //valuePropName="checked"
                          >
                            <Switch />
                            {/* //<span className="toggle_title">Risk of Waste</span> */}
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Col>
              <Col md={24} lg={9}>
                <Card>
                  <Row gutter={20}>
                    <SelectInput
                      name="delivery_type"
                      label="Delivery Type"
                      placeholder="Select Delivery Type"
                      options={dummyDeliveryType}
                      cover={{ md: 12 }}
                      className={'mb-0'}
                      rules={[
                        { required: true, message: "Missing Type Selection" },
                      ]}
                    />
                    <Col md={12}>
                      <Form.Item
                        name="min_order_price"
                        label="Min. Order Price"
                        placeholder="Enter Min. Order Price"
                        rules={[
                          {
                            required: true,
                            message: "Missing Min. Order Price",
                          },
                        ]}
                      >
                        <InputNumber placeholder="Enter Min. Order Price" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={20}>
                    <Col md={12}>
                      <Form.Item
                        name="tax"
                        label="Store Tax %"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Store Tax Percentage",
                          },
                        ]}
                      >
                        <InputNumber maxLength={2} max={100} placeholder="Enter Tax %" />
                      </Form.Item>
                    </Col>
                    <Col md={12}>
                      <Form.Item
                        name="commission_rate"
                        label="Commission Rate"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Commission Rate",
                          },
                        ]}
                      >
                        <InputNumber maxLength={2} max={100} placeholder="10 %" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
                <Row>
                  <Col md={24}>
                    <Form.Item
                      label="Location (Drag Marker for Selecting Location)"
                      name="location"
                      rules={[
                        {
                          required: true,
                          message: "Please select the location!",
                        },
                      ]}
                    >
                      <LocationMap
                        className="mt-3"
                        onChange={handleLocationChange}
                      // userData={data && data}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Card>
                  <Row gutter={20}>
                    <TextInputBox
                      name="business_id"
                      label="Business Identification Number"
                      placeholder="Enter Business Identification Number"
                      cover={{ md: 14 }}
                      rules={[
                        {
                          max: 16,
                          message: "Please Enter 16 digit BIN!",
                        },
                        {
                          required: true,
                          message: "Enter Business Identification Number",
                        },
                      ]}
                    />

                    <Col md={12}>
                      <Form.Item
                        className="mb-0"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (value !== undefined && value?.length > 0) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Logo is required"),
                              );
                            },
                          },
                        ]}
                        label="Upload legal document"
                        name="document"
                        placeholder="Upload legal document"
                      >
                        <SingleImageUpload
                          value={logo}
                          fileType={FileType}
                          imageType={"logo"}
                          onChange={(data) => handleUploadDocument(data)}
                        />
                      </Form.Item>
                    </Col>
                    {/* <SelectInput
                      name="min_order_price"
                      label="Min. Order Price"
                      placeholder="Select Min. Order Price"
                      options={[
                        { name: "100", _id: "100" },
                        { name: "200", _id: "200" },
                        { name: "300", _id: "300" },
                        { name: "500", _id: "500" },
                        { name: "1000", _id: "1000" },
                      ]}
                      cover={{ md: 10 }}
                      rules={[
                        { required: true, message: "Missing Min. Order Price" },
                      ]}
                    /> */}
                  </Row>
                </Card>

                <Row gutter={20}>
                  <Col md={24}>
                    <Form.Item
                      name="terms_and_conditions"
                      valuePropName="checked"
                      rules={[
                        {
                          required: true,
                          message: "Please accept the terms and conditions",
                        },
                      ]}
                    >
                      <Space align="baseline">
                        <Checkbox
                        //defaultChecked={true}
                        // onChange={handleTermsAndConditionsChange}
                        >
                          I accept the terms and conditions
                        </Checkbox>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Button className="primary_btn btnStyle w-100" htmlType="submit">
                    SUBMIT
                  </Button>
                </Row>
              </Col>
            </Row>
          </Form>
        </Content>
      </Layout>
    </div>
  );
};

export default Register;
