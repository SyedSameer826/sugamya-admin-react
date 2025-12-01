import { Row, Col, Radio, Modal, Form, Input } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, { useState, useEffect, useRef } from "react";
import useRequest from "../../hooks/useRequest";
import LocationMap from "./LocationMap";
import { ShowToast, Severty } from "../../helper/toast";

const UserFrom = ({ type, path, sectionName, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile: "",
    country_code: "",
  });
  const [latLong, setlatLong] = useState({ lat: 30.5595, lng: 22.9375 });
  const [location, setLocation] = useState();
  const [userAddress, setUserAddress] = useState(null);

  const handleChange = (value, data, event, formattedValue) => {
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile: value.slice(data.dialCode.length),
    });
  };

  const handleLocationChange = (value) => {
    setUserAddress(value.address);
    setlatLong({
      lat: parseFloat(value.latitude),
      lng: parseFloat(value.longitude),
    });
  };

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
    setlatLong({
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
    });
    setLocation(data.location);
    setMobileNumber({
      mobile: data.mobile_number,
      country_code: data.country_code,
    });
  }, [data]);

  const onCreate = (values) => {
    if (!mobileNumber.mobile)
      return ShowToast("Please enter mobile number", Severty.ERROR);
    if (mobileNumber.mobile.length < 8 || mobileNumber.mobile.length > 12) {
      return ShowToast(
        "Mobile number should be between 8 to 12 digits",
        Severty.ERROR,
      );
    }
    const { name, is_featured, email } = values;
    setLoading(true);
    const payload = {};
    payload.country_code = mobileNumber.country_code;
    payload.mobile_number = mobileNumber.mobile;
    payload.name = name;
    payload.email = email;
    payload.latitude = latLong.lat ? latLong.lat : null;
    payload.longitude = latLong.lng ? latLong.lng : null;
    payload.location = userAddress ? userAddress : null;
    payload.is_featured = is_featured;
    request({
      url: `${data ? path + "/" + data._id : path}`,
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
      width={1100}
      visible={show}
      title={`${
        data ? "Update " + sectionName : "Create a New " + sectionName
      }`}
      okText="Ok"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={24} lg={8} sm={12}>
            <Form.Item
              className="mb-0"
              label="Name"
              name="name"
              normalize={(value) => value.trimStart()}
              rules={[
                { required: true, message: "Please Enter the name!" },
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
                {
                  pattern: new RegExp(/^[a-zA-Z ]*$/),
                  message: "Only Alphabetic Characters Allowed!",
                },
              ]}
            >
              <Input autoComplete="off" placeholder="Enter Name" />
            </Form.Item>
          </Col>

          <Col span={24} lg={8} sm={12}>
            <Form.Item
              className="mb-0"
              label="Email Address"
              name="email"
              rules={[
                { type: "email", message: "The email is not a valid email!" },
                { required: true, message: "Please enter the email!" },
                {
                  max: 50,
                  message: "Email should not contain more then 50 characters!",
                },
                {
                  min: 5,
                  message: "Email should contain at least 5 characters!",
                },
                {
                  pattern: new RegExp(
                    /^([a-zA-Z0-9._%-]*[a-zA-Z]+[a-zA-Z0-9._%-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
                  ),
                  message: "Enter valid email!",
                },
              ]}
            >
              <Input autoComplete="off" placeholder="Enter Email Address" />
            </Form.Item>
          </Col>

          <Col span={24} lg={8} sm={12} className="flagMobileNumber">
            <Form.Item className="mb-0" label="Mobile Number">
              <PhoneInput
                inputProps={{
                  name: "mobile",
                  required: true,
                  autoFocus: false,
                  placeholder: "Enter Mobile Number",
                }}
                isValid={(value, country) => {
                  if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country.name;
                  } else if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country.name;
                  } else {
                    return true;
                  }
                }}
                country={"il"}
                value={
                  mobileNumber
                    ? (mobileNumber.country_code
                        ? mobileNumber.country_code
                        : "+27") +
                      (mobileNumber.mobile ? mobileNumber.mobile : null)
                    : "+27"
                }
                preferredCountries={["ps","il"]}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          {type !== "Sub Admin" ? (
            <Col span={24}>
              <Form.Item
                label="Location (Drag Marker for Selecting Location)"
                name="location"
                rules={[
                  { required: true, message: "Please select the location!" },
                ]}
              >
                <LocationMap
                  onChange={handleLocationChange}
                  userData={data && data}
                />
              </Form.Item>
            </Col>
          ) : null}

          {type !== "Customer" && type !== "Sub Admin" ? (
            <Col md={12}>
              <Form.Item label="Mark as Featured" name="is_featured">
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
};

export default UserFrom;
