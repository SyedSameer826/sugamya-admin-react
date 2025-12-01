import { Col, DatePicker, Form, Input, Modal, Row, Select, Image } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";
import useApi from "../../../hooks/useApi";
import apiPath from "../../../constants/apiPath";
import SingleImageUpload from "../../../components/SingleImageUpload";
import { unitedKingdomId } from "../../../constants/var";
const { Option } = Select;

const RelationOption  = [
   {
    name : "Self",
    value : "Self"
   },
   {
    name : "Spouse",
    value : "Spouse"
   }, {
    name : "Father",
    value : "Father"
   }, {
    name : "Mother",
    value : "Mother"
   }, {
    name : "Son",
    value : "Son"
   }, {
    name : "Daughter",
    value : "Daughter"
   }, {
    name : "Sibling",
    value : "Sibling"
   },
   {
    name : "Other",
    value : "Other"
   },
]

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
  const [ailments, setAilments] = useState([]);
  const [ailmentCategories, setAilmentCategories] = useState();
  const [location, setLocation] = useState();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();
  const [userss, setUserList] = useState();
  // const [categoryId, setCategoryId] = useState();
  // const [ailmentId, setAilmentId] = useState();

  const [cities, setCities] = useState();
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });

  const handleChange = (value, data) => {
    console.log("value", value, "data", data);
    var country_code = data;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data?.length),
    });
  };

  const userList = () => {
    request({
      url: `${apiPath.listPatient + "/data/checkUser"}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          setUserList(data.data);
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

  const handleApiRequest = (url, onSuccess) => {
    setLoading(true); // Set loading to true before the request
    request({
      url: url,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false); // Stop loading when request is successful
        if (data.status) {
          console.log(data.data.data.length, "data length>>>>");
          onSuccess(data.data.data); // Use onSuccess callback to handle data
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        // Handle error more gracefully in case there's no error message
        const errorMessage =
          error?.response?.data?.message || "An error occurred!";
        ShowToast(errorMessage, Severty.ERROR);
        setLoading(false); // Stop loading on error
      },
    });
  };

  // Fetch the list of ailment categories
  const ailmentCategoryList = () => {
    handleApiRequest(apiPath.listPatientAilmentCategory, setAilmentCategories);
  };

  // Fetch the list of ailments
  const ailmentList = (categoryId) => {
    handleApiRequest(
      apiPath.listPatientAilment +
        `?categoryId=${categoryId ? categoryId : ""}`,
      setAilments
    );
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
      dob: data.dob ? moment(data.dob, "DD-MM-YYYY") : null,
      ailment_category: data.categoryId?._id ? data.categoryId._id : null,
      ailmentId : data.ailmentId?.length
        ? data.ailmentId?.map((ailment) => ailment._id)
        : [],
        mobile_number: data.mobile_number
        ? data.country_code + data.mobile_number
        : undefined,
    });
    // setAilmentId(data.ailmentId?.map((ailment) => ailment._id));
    // setCategoryId(data.categoryId?._id);
    setImage(data.image);

   if(data.categoryId?._id) ailmentList(data.categoryId?._id)
    getCity({
      stateId:  data.state ? data.state: data?.country,
      cityData: (data) => setCities(data),
    });
    getState({
      countryId: data.country,
      stateData: (data) => {
        setStates(data);
      },
    });
    setMobileNumber({
      mobile_number: data.mobile_number,
      country_code: data.country_code,
    });
  }, [data]);

  const handleChangeLocation = (val) => {
    setLocation(val);
  };

  useEffect(() => {
    getCountry({ countryData: (data) => setCountries(data),});
    userList();
    ailmentCategoryList();
  }, []);

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

  const onCreate = (values) => {
    const {
      name,
      email,
      country,
      city,
      country_code,
      postal_code,
      state,
      gender,
      salutation,
      dob,marital_status,
      mobile_number,
      added_by,
      ailmentId,
      ailment_category,
      relationship_with_user
    } = values;
    const payload = {};
    setLoading(true);
    payload.name = name;
    payload.postal_code = postal_code;
    payload.mobile_number = mobileNumber.mobile_number;
    payload.country_code = mobileNumber.country_code;
    payload.email = email;
    payload.added_by = added_by;
    payload.marital_status = marital_status;
    payload.image = image;
    payload.location = location?.location;
    payload.latitude = location?.latitude;
    payload.longitude = location?.longitude;
    payload.country = country?country: null;
    payload.state = state?state: null;
    payload.city = city?city: null;
    payload.gender = gender;
    payload.ailmentId = ailmentId;
    payload.categoryId = ailment_category;
    payload.relationship_with_user = relationship_with_user;
    payload.salutation = salutation;
    payload.dob = dob ? moment(dob).format("DD-MM-YYYY") : null;
    // payload.postal_code = location?.postal_code;
    request({
      url: `${data ? api.addEdit + "/" + data?._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(
           data.message,
            Severty.SUCCESS
          );
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
            data
              ? "Edit Patient" /* sectionName */
              : "Add Patient" /* sectionName */
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
                //         new Error("Profile image is required"),
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
                  onChange={(data) => setImage(data[0].url)}
                ></SingleImageUpload>
                <Image src={image} />
                {/* <UploadImage value={image} setImage={setImage} /> */}
              </Form.Item>
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
              label={`Full Name`}
              name="name"
              rules={[
                { required: true, message: "Please enter the to name" },
                {
                  max: 100,
                  message: "Name should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: "Name should contain only alphabets and spaces!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Name`} />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12} className="flagMobileNumber">
            <Form.Item
              label="Mobile Number"
              name="mobile_number"
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
                  name: "mobile_number",
                  required: true,
                  autoFocus: false,
                  autoFormat: false,
                  autoComplete: "off",
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
                country={"ca"}
                preferredCountries={["ca", "ca"]}
                onChange={(value, country) => {
                  const countryCode = country?.dialCode; // Extract country code
                  handleChange(value, countryCode); // Pass value and country code to the handleChange function
                }}
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
              label="Marital Status"
              name="marital_status"
            >
              <Select placeholder="Select Marital Status">
                <Option value="Single">Single</Option>
                <Option value="Married">Married</Option>
                <Option value="other">Prefered not to say</Option>
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
               disabledDate={(current)=> {return current && current > moment().endOf('day')}}
                format="DD-MM-YYYY"
                placeholder="Select DOB"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12} lg={12} sm={12} className="mt-2">
            <Form.Item
              label="Related User"
              name="added_by"
              rules={[
                {
                  required: true,
                  message: "Please select the user!",
                },
              ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                // onChange={handleSelectChange}
                placeholder="Select user"
                filterOption={(input, option) => {
                  const name =
                    option?.children[2]?.props?.children || ""; // Name extraction
                   const uhid = option?.children?.[0]?.props?.children || ""; // UHID extraction
              
                  return (
                    name.toLowerCase().includes(input.toLowerCase()) ||
                    uhid.toLowerCase().includes(input.toLowerCase()) // ✅ Both fields checked
                  );
                }}
              >
                {userss?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    <span>{doc.uhid}</span>
                    <br />
                    <span>
                      {doc.name
                        ? doc.name
                        : doc.firstName
                        ? doc.firstName + " " + doc.lastName
                        : "-"}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} lg={12} sm={12} className="mt-2">
            <Form.Item
              label="Relationship with app User"
              name="relationship_with_user"
              rules={[
                {
                  required: true,
                  message: "Please select the type!",
                },
              ]}
            >
              <Select
                // showSearch
                style={{ width: "100%" }}
                // onChange={handleSelectChange}
                placeholder="Select Relation"
                // filterOption={(input, option) => {
                //   const name = option?.children[2]?.props?.children || "";
                //   return name.toLowerCase().includes(input.toLowerCase());
                // }}
              >
                {RelationOption?.map((doc) => (
                  <Option key={doc.value} value={doc.value}>
                    {doc?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} lg={12} sm={24} className="mt-2">                        
            <Form.Item
              label="Ailment Category"
              name="ailment_category"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the category!",
              //   },
              // ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Category"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onChange={(val) => {ailmentList(val);
                                  //  setCategoryId(val)
                                  form.setFieldsValue({ailmentId : []})}}
                // value={categoryId}
              >
                {ailmentCategories?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={24} className="mt-2">
            <Form.Item
              label="Ailment"
              name="ailmentId"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the ailment!",
              //   },
              // ]}
            >
             
              <Select
                mode="multiple" // Enable multi-select mode
                showSearch
                style={{ width: "100%" }}
                placeholder="Select ailment"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                // onChange={(val) => setAilmentId(val)}
                // value={ailmentId} // val will be an array of selected values
              >
                {ailments?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={24} className="mt-2">
            <Form.Item
              label="Zip/Pin Code"
              name="postal_code"
              rules={[
                {
                  required: true,
                  message: "Please select the postal_code!",
                },
              ]}
            >
           <Input placeholder="Enter Zip/pin code"/>
            </Form.Item>
          </Col>


          <Col span={24} lg={12} sm={24} className="mt-2">
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
                {countries?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {states?.length > 0 ?
                    (
          unitedKingdomId !== form.getFieldValue("country") && <Col span={24} lg={12} sm={24} className="mt-2">
            <Form.Item
            label={unitedKingdomId !== form.getFieldValue("country") ? "State" : "City"}
              name="state"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the state!",
              //   },
              // ]}
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
          </Col>
          )
                  : ""}

         {cities?.length > 0
                    ?
          <Col span={24} lg={12} sm={24} className="mt-2">
            <Form.Item
              label="City"
              name="city"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the city!",
              //   },
              // ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Select City"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {cities?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
       : ""
        }
          {/* 
          <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Location (Drag Marker for Selecting Location)"
              name="location"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the location!",
              //   },
              // ]}
            >
              <LocationMap
                className="mt-3"
                onChange={(val) => {
                  handleChangeLocation(val);
                }}
                userData={data}
                editLocation={location}
              />
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
