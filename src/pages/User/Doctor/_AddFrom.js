import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Image,
  TimePicker,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import useApi from "../../../hooks/useApi";

import "react-phone-input-2/lib/style.css";
import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";
import apiPath from "../../../constants/apiPath";
import LocationMap from "../LocationMap";
import MultipleImageUpload from "../../../components/MultipleImageUpload";
import SingleImageUpload from "../../../components/SingleImageUpload";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import UploadImage from "../../../components/_UploadImage";
import pdfIcon from "../../../assets/images/pdficon.png"
import { unitedKingdomId } from "../../../constants/var";
const weekdays = [
  { name: "sunday", label: "Sunday" },
  { name: "monday", label: "Monday" },
  { name: "tuesday", label: "Tuesday" },
  { name: "wednesday", label: "Wednesday" },
  { name: "thursday", label: "Thursday" },
  { name: "friday", label: "Friday" },
  { name: "saturday", label: "Saturday" },
];

const format = "h:mm a";
const { Option } = Select;

const AddForm = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const { getState, getCity, getCountry } = useApi();

  const [imageUrl, setImageUrl] = useState();

  const [image, setImage] = useState("");
  const [degree, setDegree] = useState();
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();

  const [cities, setCities] = useState();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });

  const [availableWorkingDays, setAvailableWorkingDays] = useState(weekdays);
  const [location, setLocation] = useState();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorDob, setDoctorDob] = useState(
    moment("2009-01-01", "DD-MM-YYYY")
  );

  const [fileData, setFileData] = useState([]);
  const [assignedDotors, setAssignedDotors] = useState([]);
  const [isHeadDoctor, setIsHeadDoctor] = useState(false);

  const handleSelectWorkDays = (day) => {
    setAvailableWorkingDays((prev) => {
      return prev.filter((item) => {
        return item.name !== day;
      });
    });
  };

  const handleChange = (value, data) => {
    var country_code = data?.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(country_code?.length),
    });
  };

  const handleAssignHeadDoctor = (e) => {
    setIsHeadDoctor(e.target.checked);
    if (e.target.checked && !assignedDotors?.length) getAssignDoctors();
  };

  const handleImage = (data) => {
    console.log(data, "data");
    data.length > 0 ? setImage(data[0].url) : setImage([]);
  };

  const getAssignDoctors = () => {
    request({
      url: apiPath.doctor + "/assign-doctors-list",
      method: "GET",
      onSuccess: (data) => {
        if (!data.status) return;
        setAssignedDotors(data?.data);
        console.log("AssignedDotors :: ", data.data);
      },
      onError: (err) => {
        console.log("AssignedDotors :: ", data?.message);
        ShowToast(err?.response?.data?.message, Severty.ERROR);
      },
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

    const updatedAvailability = data?.availability?.map((item, index) => {
      const updatedTimeSlots = [
        moment(item.availability_time_from),
        moment(item.availability_time_to),
      ];

      return [
        {
          time_slots: [updatedTimeSlots],
          day: item.availability_day,
        },
      ];
    });

    console.log(updatedAvailability, 13666);

    form.setFieldsValue({
      ...data,
      // document:fileData,
      availability: updatedAvailability,
      dob: data?.dob ? moment(data?.dob, "DD-MM-YYYY") : "",
    });

    getCity({
      stateId: data.state,
      cityData: (data) => setCities(data),
    });
    getState({
      countryId: data.country,
      stateData: (data) => {
        setStates(data);
      },
    });
    setIsHeadDoctor(data?.is_head_doctor);
    setDoctorDob(moment(data?.dob, "DD-MM-YYYY"));
    setImage(data.image);
    setDegree(data.degree);
    setFileData(data.document);
    setMobileNumber({
      mobile_number: data.mobile_number,
      country_code: data.country_code,
    });
    if (data.is_head_doctor === true) {
      getAssignDoctors();
    }
  }, [data]);
  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);

  const onCreate = (values) => {
    console.log(values, "formpayload");
    const payload = {
      ...values,
      image: image ?? null,
      degree: degree ?? null,
      document: fileData ?? null,
      is_head_doctor: !!values.is_head_doctor,
      experience: values.experience,
      country_code: mobileNumber.country_code,
      mobile_number: mobileNumber.mobile_number,
      location: location?.location,
      latitude: location?.latitude,
      longitude: location?.longitude,
      country: values.country,
      city: values.city,
      dob: doctorDob,
      state: values.state,
      postal_code: location?.postal_code,
    };

    //  return console.log(payload, "payload");

    request({
      url: `${data ? api.doctor + "/" + data._id : api.doctor}`,
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

  const handleChangeLocation = (val) => {
    setLocation(val);
  };

  console.log("check of bug issyess", data);

  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/jfif",
    "application/pdf",
  ];

  const handleVenueImage = (data) => {
    if (!data.length) return;
    setFileData(data.map((item) => item.url));
    // setImage(data[0]?.url);
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString, "date>>>>>>");
    setDoctorDob(dateString);
  };

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? "Update" : "Add"}
      // onOk={onCreate}
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
        initialValues={
          {
            // ...data,
            // dob: moment("1990-01-01", "DD-MM-YYYY"),
          }
        }
      >
        <div className="add_user_title">
          <h4 className="modal_title_cls">{`${
            (data ? "Edit " : "Add ") + "Doctor"
          }`}</h4>
        </div>
        <Row gutter={[16, 0]}>
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
              </Form.Item>

              {image ? <Image src={image} /> : ""}
            </div>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Name`}
              name="name"
              rules={[
                { required: true, message: "Please enter the name" },
                {
                  max: 100,
                  message: "Name should not contain more than 100 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
                {
                  pattern: /^[A-Za-z\s]+$/,
                  message: "Name should contain only alphabetic characters!",
                },
                {
                  pattern: /^[A-Z][a-zA-Z\s]*$/,
                  message:
                    "Name should start with a capital letter and contain only alphabetic characters!",
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
              // name="mobile_number"
              rules={[
                {
                  required: false,
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
                    return "Invalid value: " + value + ", " + country?.name;
                  } else if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country?.name;
                  } else if (!/^\d{8,15}$/.test(mobileNumber?.mobile_number)) {
                    return "Phone number must be between 8 and 18 digits";
                  } else {
                    return true;
                  }
                }}
                country={"ca"}
                // preferredCountries={["ps", "il"]}
                value={
                  mobileNumber
                    ? (mobileNumber.country_code
                        ? mobileNumber.country_code
                        : "+27") +
                      (mobileNumber.mobile_number
                        ? mobileNumber.mobile_number
                        : null)
                    : "+27"
                }
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col span={24} lg={24} sm={24}>
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

          <Col span={24} lg={24} sm={24}>
            <Form.Item
              label="Experience"
              name="experience"
              // rules={[
              //   { required: true, message: "Please enter the experience!" },
              // ]}
            >
              <Input autoComplete="off" placeholder="Enter Expereience" />
            </Form.Item>
          </Col>
          <Col span={24} lg={24} sm={24}>
            {/* { console.log( moment(data?.dob).format("DD-MM-YYYY"), "yess>>>")} */}

            <Form.Item
              label="Date of Birth"
              name="dob"
              // rules={[{ required: true, message: "Please enter the DOB!" }]}
            >
              <DatePicker
                format="DD-MM-YYYY" // Corrected the format prop
                defaultPickerValue={doctorDob}
                // disabledDate={(current)=> {return current && current > moment().endOf('day')}}

                // disabledDate={(current) => {
                //   // Disable dates that are before January 1, 1925 or after December 31, 2009
                //   const minDate = moment("1925-01-01", "DD-MM-YYYY");
                //   const maxDate = moment("2009-12-31", "DD-MM-YYYY");

                //   return (
                //     current &&
                //     (current.isBefore(minDate) || current.isAfter(maxDate))
                //   );
                // }}
                disabledDate={(current)=> {return current && current > moment().endOf('day')}}
                onChange={(date, dateString) => onChange(date, dateString)}
              />
            </Form.Item>
          </Col>
          <Col span={24} lg={24} sm={24}>
            <Form.Item
              label="Gender"
              name="gender"
              // rules={[{ required: true, message: "Please enter the gender!" }]}
            >
              <Select onChange={(value) => form.setFieldValue("gender", value)}>
                <Option value="female">Female</Option>
                <Option value="male">Male</Option>

                <Option value="others">Others</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} lg={24} sm={24}>
            <Form.Item
              label="Specialist"
              name="specialist"
              // rules={[
              //   { required: true, message: "Please enter the specialist!" },
              // ]}
            >
              <Input autoComplete="off" placeholder="Enter specialisation" />
            </Form.Item>
          </Col>

          <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Country"
              name="country"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please select the country!",
              //   },
              // ]}
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

        {unitedKingdomId !== form.getFieldValue("country") &&  <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label={ "State" }
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
          </Col>}

          { <Col span={24} lg={24} sm={24} className="mt-2">
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
          </Col>}
          {/* 
          <Col span={24} lg={24} sm={24} className="mt-2">
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
                onChange={(val) => {
                  handleChangeLocation(val);
                }}
                userData={data}
                editLocation={location}
              />
            </Form.Item>
          </Col> */}

          <Col span={24} sm={12}>
            <Form.Item
              name="is_head_doctor"
              className="aligin-center"
              valuePropName="checked"
            >
              <Checkbox
                checked={isHeadDoctor}
                onChange={handleAssignHeadDoctor}
              >
                Mark Doctor as Head Doctor
              </Checkbox>
            </Form.Item>
          </Col>

          {isHeadDoctor && (
            <Col span={24} sm={24}>
              <Form.Item
                label="Assigned Doctors"
                name="assigned_doctors"
                // rules={[{ required: true, message: "Please select a doctor!" }]}
              >
                {/* <Button type="dashed" style={{ marginTop: '10px' }} >
    Upload More
  </Button> */}
                <Select
                  className="asign-select"
                  filterOption={(input, option) =>
                    option.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  placeholder="Select Doctors"
                  showSearch
                  mode="multiple"
                >
                  {assignedDotors?.map((item) => (
                    <Select.Option
                      key={item?._id}
                      label={item?.name}
                      value={item?._id}
                    >
                      {item?.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={24}>
          <Col span={24} sm={12} className="mb-3">
            <div className="  img-uploder main-imgupload-3">
              <Form.Item
                className="  mb-0 uplod-img"
                // rules={[
                //   {
                //     validator: (_, value) => {
                //       if (image) {
                //         return Promise.resolve();
                //       }
                //       // return Promise.reject(new Error("Document is required"));
                //     },
                //   },
                // ]}
                name="document"
                label="Upload Registration Certificate"
              >
                {/* <UploadImage
                  className=""
                  type={"pdf"}
                  value={degree}
                  setImage={setDegree}
                  onRemoveImage={() => setDegree()}
                /> */}
                {/* <Upload className="" type={"pdf"} value={degree} setImage={setDegree}  >
                  <Button icon={<UploadOutlined />}> Upload Certificate</Button>
                </Upload> */}
                <MultipleImageUpload
                  data={fileData}
                  value={fileData}
                  imageType={"pdf"}
                  fileType={[...FileType, "application/pdf"]}
                  onChange={handleVenueImage}
                />
                {fileData?.length > 0 ? (
                  fileData.map((fileUrl) =>
                    fileUrl?.endsWith(".pdf") ? (
                      <span key={fileUrl}>
                         <Image src={pdfIcon}/>
                      </span>
                    ) : (
                      <Image
                        src={fileUrl}
                        width={50}
                        height={50}
                        alt="File"
                        key={fileUrl}
                      />
                    )
                  )
                ) : (
                  ""
                )}

                {/* <div className="main-up-more-btn">
          <Button icon={<PlusCircleOutlined />} type="dashed" onClick={() => {   }}></Button>
          </div> */}
              </Form.Item>
            </div>
          </Col>
          <Col span={24} sm={12}>
            <div className="img-uploder main-imgupload-3">
              <Form.Item
                className=" mb-0 uplod-img "
                // rules={[
                //   {
                //     validator: (_, value) => {
                //       if (degree) {
                //         return Promise.resolve();
                //       }
                //       // return Promise.reject(new Error("Document is required"));
                //     },
                //   },
                // ]}
                name="degree"
                label="Upload Degree Certificate"
              >
                {/* <UploadImage
                  className=""
                  type={"pdf"}
                  value={degree}
                  setImage={setDegree}
                  onRemoveImage={() => setDegree()}
                /> */}
                <SingleImageUpload
                  value={degree}
                  fileType={[...FileType, "application/pdf"]}
                  imageType={"pdf"}
                  btnName={"Degree"}
                  onChange={(data) => setDegree(data?.[0]?.url)}
                ></SingleImageUpload>
                {degree ? (
                  degree.endsWith(".pdf") ? (
                    <Image src={pdfIcon} alt="Degree" />
                  ) : (
                    <Image src={degree} alt="Degree" />
                  )
                ) : (
                  ""
                )}
                {/* <div className="main-up-more-btn">
            <Button icon={<PlusCircleOutlined />} type="dashed" onClick={() => {   }}></Button>
            </div> */}

                {/* <Upload className="" type={"pdf"} value={fileData} setImage={setFileData} >
                  <Button icon={<UploadOutlined />}>  Upload</Button>
                </Upload> */}
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
