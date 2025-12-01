import { Col, DatePicker, Form, Input, Modal, Row, Select, Image } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import LocationMap from "../LocationMap";
import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";
import useApi from "../../../hooks/useApi";
import SingleImageUpload from "../../../components/SingleImageUpload";
import { unitedKingdomId } from "../../../constants/var";
const { Option } = Select;
const AddForm = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const { getState, getCity, getCountry } = useApi();
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];
  const [image, setImage] = useState();
  const [location, setLocation] = useState();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [cities, setCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const handleChange = (value, data) => {
    var country_code = data?.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value?.slice(data?.dialCode?.length),
    });
  };

  useEffect(() => {
    if (!data) return;
    setLocation({
      location: data?.location,
      latitude: data?.latitude,
      longitude: data?.longitude,
      city: data?.city,
      country: data?.country,
      postal_code: data?.postal_code,
    });

    form.setFieldsValue({
      ...data,
      firstName: data.name ? data.name.split(" ")[0] : "", // Extract the first name
      lastName: data.name ? data.name.split(" ").slice(1).join(" ") : "", // Extract the last name
      dob: data.dob ? moment(data.dob, "DD-MM-YYYY") : "",
      mobile: data.mobile_number
        ? data.country_code + data.mobile_number
        : undefined,
    });

    setImage(data.image);
    // if (data?.state || data?.country) {
      console.log("data?.state", data?.state);
      console.log("data?.country", data?.country);
         getCity({
      stateId: data.state ? data.state: data?.country,
      // countryId:  data?.country,
      cityData: (data) => setCities(data),
    });
      // getCity({
      //   stateId: data?.state,
      //   cityData: (data) => setCities(data),
      // });
    // }
    if (data?.country) {
      getState({
        countryId: data?.country,
        stateData: (data) => {
          setStates(data);
        },
      });
    }
    setMobileNumber({
      mobile_number: data.mobile_number ?? undefined,
      country_code: data.country_code ?? undefined,
    });
  }, [data]);

  const handleChangeLocation = (val) => {
    setLocation(val);
  };

  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);

  const onCreate = (values) => {
    const {
      firstName,
      lastName,
      email,
      state,
      country,
      city,
      salutation,
      gender,
      dob,
    } = values;
    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`;
    const payload = {...values};
    setLoading(true);
    // payload.gender = gender;
    // payload.salutation = salutation;
    // payload.dob = dob;
    payload.name = name;
    // payload.firstName = firstName;
    // payload.lastName = lastName;
    payload.mobile_number = mobileNumber?.mobile_number;
    payload.country_code = mobileNumber?.country_code;
    // payload.email = email;
    payload.image = image;
    payload.location = location?.location;
    payload.latitude = location?.latitude;
    payload.longitude = location?.longitude;
    payload.country = country?country: null;
    payload.state = state?state: null;
    payload.city = city?city: null;
    payload.postal_code = location?.postal_code;
    console.log(data, "data>>>>>>>>>.");
    request({
      url: `${data ? api.addEdit + "/" + data?._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
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
  const handleSelectChange = (value) => {
    handleStateChange(value)

    getState({
      countryId: value,
      stateData: (data) => {
        setStates(data);
      },
    });
    form.setFieldsValue({
      state: "",
      city: "",
    });
  };
  const handleStateChange = (value) => {
    getCity({
      stateId: value,
      countryId: value,
      cityData: (data) => setCities(data),
    });

    form.setFieldsValue({
      city: "",
    });
  };

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? "Update" : "Add"}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form
        id="create"
        form={form}
        onFinish={onCreate}
        layout="vertical"
        initialValues={{
          dob: "",
        }}
      >
        <div className="add_user_title">
          <h4 className="modal_title_cls">{`${
            data ? "Edit User" /* sectionName */ : "Add User" /* sectionName */
          }`}</h4>
        </div>
        <Row gutter={[24, 0]}>
          <Col span={24}>
            <div className="text-center">
              <Form.Item
                className="upload_wrap"
                // rules={[
                //   {
                //     validator: (_, value) => {
                //       if (image) {
                //         return Promise.resolve();
                //       }
                //       return Promise.reject(
                //         new Error("Profile image is required")
                //       );
                //     },
                //   },
                // ]}
                name="image"
              >
                <SingleImageUpload
                  fileType={FileType}
                  imageType={"image"}
                  btnName={"Profile Picture"}
                  onChange={(data) => setImage(data?.[0]?.url)}
                ></SingleImageUpload>
                {/* <UploadImage value={image} setImage={setImage} /> */}
              </Form.Item>

              <Image src={image} />
            </div>
          </Col>

          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Salutation"
              name="salutation"
              rules={[{ required: true, message: "Please select salutation!" }]}
            >
              <Select placeholder="Select Salutation">
                <Option value="Mr">Mr</Option>
                <Option value="Mrs">Mrs</Option>
                <Option value="Miss">Miss</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please enter the first name" },
                {
                  max: 50,
                  message:
                    "First Name should not contain more than 50 characters!",
                },
                {
                  min: 2,
                  message: "First Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder="Enter First Name" />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please enter the last name" },
                {
                  max: 50,
                  message:
                    "Last Name should not contain more than 50 characters!",
                },
                {
                  min: 2,
                  message: "Last Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder="Enter Last Name" />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12} className="flagMobileNumber">
            <Form.Item
              label="Mobile Number"
              name="mobile"
              rules={[
                {
                  required: true,
                  validator: (rule, value) => {
                    if (!value) {
                      return Promise.reject("Please enter phone number");
                    }
                    if (!/^\d{10,15}$/.test(value)) {
                      return Promise.reject(
                        "Phone number must be between 8 and 18 digits"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput
                inputProps={{
                  name: "mobile",
                  required: true,
                  autoFocus: false,
                  autoFormat: false,
                  autoComplete: "off",
                }}
                isValid={(value, country) => {
                  if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country?.name;
                  } else if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country?.name;
                  } else if (!/^\d{8,15}$/.test(value)) {
                    return "Phone number must be between 8 and 18 digits";
                  } else {
                    return true;
                  }
                }}
                country={"ca"}
                // preferredCountries={["ps", "il"]}
                // value={
                //   mobileNumber
                //     ? (mobileNumber.country_code
                //         ? mobileNumber.country_code
                //         : "+27") +
                //       (mobileNumber.mobile_number ? mobileNumber.mobile_number : null)
                //     : "+27"
                // }
                onChange={handleChange}
              />
            </Form.Item>
          </Col>
          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Email ID"
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
                    /^([a-zA-Z0-9._%-]*[a-zA-Z]+[a-zA-Z0-9._%-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
                  ),
                  message: "Enter valid email!",
                },
              ]}
            >
              <Input autoComplete="off" placeholder="Enter Email Address" />
            </Form.Item>
          </Col>
          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select gender!" }]}
            >
              <Select placeholder="Select Gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Date of Birth"
              name="dob"
              rules={[
                { required: true, message: "Please select Date of Birth!" },
                {
                  validator: (_, value) => {
                    const isValidDate = moment(
                      value,
                      "DD-MM-YYYY",
                      true
                    ).isValid();
                    if (!isValidDate) {
                      return Promise.reject(
                        new Error(
                          "Please enter a valid Date of Birth (DD-MM-YYYY)!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                disabledDate={(current) => {
                  return current && current > moment().endOf("day");
                }}
                format="DD-MM-YYYY"
                placeholder="Select DOB"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Country"
              name="country"
              rules={[
                {
                  required: true,
                  message: "Please select the country!",
                },
              ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                onChange={handleSelectChange}
                placeholder="Select country"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {countries.length > 0
                  ? countries?.map((doc) => (
                      <Option key={doc._id} value={doc._id}>
                        {doc.name}
                      </Option>
                    ))
                  : ""}
              </Select>
            </Form.Item>
          </Col>

          {states?.length > 0 ?
          (unitedKingdomId !== form.getFieldValue("country") && <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
                label={"State" }
              name="state"
              rules={[
                {
                  required: true,
                  message: "Please select the state!",
                },
              ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                onChange={handleStateChange}
                placeholder="Select state"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                   {states?.map((doc) => (
                      <Option key={doc._id} value={doc._id}>
                        {doc.name}
                      </Option>
                    ))}
              </Select>
            </Form.Item>
          </Col>)
                  : ""}

          {cities?.length > 0
                    ?
            <Col span={24} lg={24} sm={24} className="mt-2">
              <Form.Item
                label="City"
                name="city"
                rules={[
                  {
                    required: true,
                    message: "Please select the city!",
                  },
                ]}
              >
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Select City"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  { cities?.map((doc) => (
                        <Option key={doc._id} value={doc._id}>
                          {doc.name}
                        </Option>
                      ))
                    }
                </Select>
              </Form.Item>
            </Col>: ""
          }
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
