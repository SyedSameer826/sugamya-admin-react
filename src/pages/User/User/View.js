import {
  Row,
  Col,
  Card,
  Button,
  Skeleton,
  Avatar,
  Input,
  Modal,
  Form,
  Image,
  Tooltip,
  Select,
  Table,
  Tag,
} from "antd";
import React, { useState, useContext, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { Link, useParams, useNavigate } from "react-router-dom";
import useRequest from "../../../hooks/useRequest";
import { ShowToast, Severty } from "../../../helper/toast";
import apiPath from "../../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../../context/AppContext";
import moment from "moment";
import useApi from "../../../hooks/useApi";
import { calculateAgeInYearsAndMonths } from "../../../helper/functions";
const { Option } = Select;
function View() {
  const sectionName = "User";
  const routeName = "user";
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();
  const { setPageHeading } = useContext(AppStateContext);
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState({});

  const [patients, setPatients] = useState([]);
  const [doctorAge, setDoctorAge] = useState();
  const [address, setAddresses] = useState();
  const [refresh, setRefresh] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [showDelete, setShowDelete] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const { getState, getCity, getCountry } = useApi();
  const [byAddress, setByAddress] = useState({});
  const [selected, setSelected] = useState();
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });
  const handleAddAddressClick = () => {
    setVisible(true);
  };
  console.log("selected:::::::::::::::::::::::::::", selected);

  const fetchbyAddress = (selected) => {
    setLoading(true);
    request({
      url: apiPath.listUser + "/address/" + selected,
      method: "GET",
      onSuccess: ({ status, data }) => {
        console.log(data);
        if (!status) return;
        setLoading(false);
        setByAddress(data);
       
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  console.log(byAddress);
  const handleCancel = () => {
    setVisible(false);
  };
  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);
  const handleSubmit = async () => {
    console.log("check its working");
    try {
      setLoading(true);
      const formData = await form.validateFields();
      console.log("Form data:", formData);

      // Extract form values
      const {
        user_id,
        address,
        default_address,
        name,
        country_code,
        area,
        pinCode,
        mobileNumber,
        state_id,
        country_id,
        city_id,
        building_no,
        landmark,
        latitude,
        longitude,
        tags,
        save_as,
      } = formData;
      // Construct payload object
      const payload = {
        // Assuming `req.user.id` is available in scope
        user_id: `${params.id}`,
        address,
        default_address,
        name,
        country_code,
        area,
        pinCode,
        mobileNumber,
        state_id,
        country_id,
        city_id,
        building_no,
        landmark,
        latitude,
        longitude,
        tags,
        save_as,
        dialCode
      };

      // Perform API request
      request({
        url: `${!selected?apiPath.address: apiPath.editAddress+"/"+ selected}`,
        method: !selected?"POST": "PUT",
        data: payload,
        onSuccess: (data) => {
          setLoading(false);

          if (data.status) {
            ShowToast(data.message, Severty.SUCCESS);
            fetchAddress(params.id);
            // hide();
            // refresh();
          } else {
            ShowToast(data.message, Severty.ERROR);
          }
        },
        onError: (error) => {
          ShowToast(error.response.data.message, Severty.ERROR);
          setLoading(false);
        },
      });

      // Reset form fields
      form.resetFields();
      setVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = (id) => {
    setLoading(true);
    request({
      url: apiPath.listUser + "/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        console.log(data, "dtataat>>>>>>>>..");
        if (!status) return;
        setLoading(false);
        setDoctor(data);
        setDoctorAge(calculateAge(data.dob));
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const fetchPatients = (id) => {
    setLoading(true);
    request({
      url: apiPath.listUser + "/patients/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        console.log(data);
        if (!status) return;
        setLoading(false);
        setPatients(data.data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchAddress = (id) => {
    setLoading(true);
    request({
      url: apiPath.listUser + "/address/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        console.log(data);
        if (!status) return;
        setLoading(false);
        setAddresses(data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const handleSelectChange = (value) => {
    getState({
      countryId: value,
      stateData: (data) => {
        setStates(data);
      },
    });

    form.setFieldsValue({
      state_id: "",
      city_id: "",
    });
  };
  const handleStateChange = (value) => {
    console.log("value", value);
    // Fetch cities based on the selected state
    getCity({
      stateId: value,
      cityData: (data) => setCities(data),
    });
      form.setFieldsValue({
      city_id: "",
    });
  };
  useEffect(() => {
    fetchData(params.id);
    fetchPatients(params.id);
    fetchAddress(params.id);
  }, []);

  const handleDeleteConfirm = (id) => {
    request({
      url: apiPath.deleteAddress + "/" + selectedToDelete,
      method: "DELETE",
      onSuccess: (data) => {
        ShowToast(data.message, Severty.SUCCESS);
        fetchAddress(params.id);
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
    setShowDelete(false);
  };
  const handleDeleteCancel = () => {
    // Cancel the delete action and close the modal
    setShowDelete(false);
    setSelectedToDelete(null);
  };
  const handleDeleteClick = (record) => {
    setSelectedToDelete(record);
    setShowDelete(true);
  };

  function calculateAge(dob) {
    // Parse the DOB and current date
    const currentDate = new Date();
    const dobDate = new Date(dob);
    const currentDateObj = new Date(currentDate);

    // Calculate the difference in milliseconds
    let ageDiffMs = currentDateObj - dobDate;

    // Convert milliseconds to years, months, and days
    let ageDate = new Date(ageDiffMs);
    let ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
    let ageMonths = ageDate.getUTCMonth();
    let ageDays = ageDate.getUTCDate() - 1; // Subtract 1 to get days, as getUTCDate returns the day of the month (1 to 31)

    return {
      years: ageYears,
      months: ageMonths,
      days: ageDays,
    };
  }
  const route = "patient";
  const views = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };

  const PatientColumns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * pagination.pageSize + (index + 1),
    },
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      filters: [
        {
          text: "A-Z",
          value: 1,
        },
        {
          text: "Z-A",
          value: -1,
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, { uhid, _id }) => {
        return uhid ? <Link to={`/${route}/view/${_id}`}> {uhid} </Link> : _id;
      },
    },
    {
      title: "User Id",
      dataIndex: "userId",
      key: "userId",
      filters: [
        {
          text: "A-Z",
          value: 1,
        },
        {
          text: "Z-A",
          value: -1,
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, { added_by, _id }) => {
        return added_by ? (
          added_by.uhid
        ) : (
          _id
        );
      },
    },
    {
      title: "Salutation",
      dataIndex: "name",
      key: "salutation",
      width: 200,
      render: (_, { salutation }) => {
        return salutation ? salutation.trim() : "-"; // If salutation exists, return it, otherwise return a placeholder
      },
    },
    {
      title: "First Name",
      dataIndex: "name",
      key: "firstName",
      render: (name) => {
        const [firstName, lastName] = name.split(" ");
        return firstName || "-";
      },
    },
    {
      title: "Last Name",
      dataIndex: "name",
      key: "lastName",
      render: (name) => {
        const [firstName, lastName] = name.split(" ");
        return lastName || "-";
      },
    },

    {
      title: "Phone Number",
      dataIndex: "number",
      key: "number",
      render: (_, { mobile_number, country_code }) => {
        return mobile_number || country_code ? (
          <span className="cap">{ `+${country_code ? country_code : "91"} ${mobile_number}`}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, { email }) => email,
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: "gender",
    },
    {
      title: "DOB",
      key: "dob",
      dataIndex: "dob",
      render: (dob) => <span>{dob}</span>,
    },
    {
      title: "Age",
      key: "age",
      dataIndex: "age",
      render: (_, { dob }) => {
        const age = calculateAge(dob ? dob : 0);
        console.log(age, "age>>>>>>>>>>>");
        return (
          <span>
            {" "}
            {dob ? calculateAgeInYearsAndMonths(dob) : "-"}
            {/* {age
              ? age.years && age.years !== 0
                ? `${age.years} years`
                : age.months && age.months !== 0
                ? `${age.months} months`
                : age.days && age.days !== 0
                ? `${age.days} days`
                : "-"
              : "-"} */}
          </span>
        );
      },
    },
    {
      title: "Marital Status",
      key: "marital_status",
      dataIndex: "marital_status",
      render: (marital_status) => <span>{marital_status}</span>,
    },
    {
      title: "Relationship with user",
      key: "relationship_with_user",
      dataIndex: "relationship_with_user",
      render: (relationship_with_user) => <span>{relationship_with_user}</span>,
    },
    {
      title: "Ailment Category",
      key: "categoryId",
      dataIndex: "categoryId",
      render: (_, { categoryId }) => {
        return <spna>{categoryId?.name}</spna>;
      },
    },
    {
      title: "Ailment",
      key: "ailmentId",
      dataIndex: "ailmentId",
      render: (_, { ailmentId }) => {
        return <span>{ailmentId?.map((ailment) => ailment.name + ", ")}</span>;
      },
    },
    {
      title: "Billing Postal Code ",
      key: "postal_code",
      dataIndex: "postal_code",
    },
    // {
    //   title: "Location ",
    //   key: "location",
    //   dataIndex: "location",
    //   render: (_, { location }) => {
    //     return <span className="log-width">{location}</span>;
    //   },
    // },
    {
      title: " Billing City",
      key: "city",
      dataIndex: "city",
      render: (_, { city }) => {
        return <spna>{city?.name}</spna>;
      },
    },
    {
      title: "Billing State",
      key: "state",
      dataIndex: "state",
      render: (_, { state }) => {
        return <spna>{state?.name}</spna>;
      },
    },
    {
      title: "Billing Country",
      key: "country",
      dataIndex: "country",
      render: (_, { country }) => {
        return <spna>{country?.name}</spna>;
      },
    },
    // {
    //   title: "Address",
    //   key: "address",
    //   dataIndex: "address",
    //   render: (_, { addressDet }) => {
    //     return <spna>{addressDet?.address}</spna>;
    //   },
    // },
    {
      title: "Status",
      key: "is_active",
      filters: [
        {
          text: "Active",
          value: true,
        },
        {
          text: "Inactive",
          value: false,
        },
      ],
      render: (_, { is_active, _id, is_deleted }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              // onClick={(e) => {
              //   !is_deleted
              //     ? showConfirm({
              //         record: _id,
              //         path: api.patient + "/status",
              //         onLoading: () => setLoading(true),
              //         onSuccess: () => setRefresh((prev) => !prev),
              //       })
              //     : message.error("Delete patient does not change status");
              // }}
              color={color}
              key={is_active}
            >
              {is_active ? "Active" : "Inactive"}
            </Tag>
          </a>
        );
      },
    },
  
    {
      title: "Registered Date",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
  ];

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
    setPageHeading("User Activity");
  };
  const AddressColumns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        `${
          pagination.current === 1
            ? index + 1
            : (pagination.current - 1) * 10 + (index + 1)
        }`,
    },
    {
      title: "Save As",
      dataIndex: "save_as",
      key: "save_as",
      render: (_, { save_as, _id }) => {
        return save_as ? save_as : "-";
      },
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      render: (_, { user_id, _id , name}) => {
        return name ? name : "-";
      },
    },
    {
      title: "Building/House/Flat No.",
      dataIndex: "building_no",
      key: "building_no",
      render: (_, { building_no }) => {
        return building_no ? <span className="cap">{building_no}</span> : "-";
      },
    },
    {
      title: "Zip Code",
      dataIndex: "pinCode",
      key: "pinCode",
      render: (_, { pinCode }) => {
        return pinCode ? <span className="cap">{pinCode}</span> : "-";
      },
    },
    {
      title: "Area/Street",
      dataIndex: "area",
      key: "area",
      render: (_, { area, address }) => {
        return area ? area : address;
      },
    },
    // {
    //   title: "Address",
    //   dataIndex: "address",
    //   key: "address",
    //   render: (_, { address }) => {
    //     return address ? <span className="cap">{address}</span> : "-";
    //   },
    // },
    {
      title: "Landmark",
      dataIndex: "landmark",
      key: "landmark",
      render: (_, { landmark, _id }) => {
        return landmark ? landmark : "-";
      },
    },
    // {
    //   title: "Tag",
    //   dataIndex: "tag",
    //   key: "tag",
    //   render: (_, { tag }) => {
    //     return tag ? <span className="cap">{tag}</span> : "-";
    //   },
    // },
    // {
    //   title: "Mobile Number",
    //   dataIndex: "mobileNumber",
    //   key: "mobileNumber",
    //   render: (_, { mobileNumber, _id }) => {
    //     return mobileNumber ? mobileNumber : "-";
    //   },
    // },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (_, { country_id }) => {
        return country_id ? (
          <span className="cap">{country_id.name}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (_, { state_id }) => {
        return state_id ? <span className="cap">{state_id.name}</span> : "-";
      },
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (_, { city_id }) => {
        return city_id ? <span className="cap">{city_id.name}</span> : "-";
      },
    },
    // {
    //   title: "Pin Code",
    //   dataIndex: "pinCode",
    //   key: "pinCode",
    //   render: (_, { pinCode, _id }) => {
    //     return pinCode ? pinCode : "-";
    //   },
    // },
    {
      title: "default Address",
      dataIndex: "default_address",
      key: "default_address",
      render: (_, { default_address }) => {
        return default_address ? (
          <span className="cap">{default_address}</span>
        ) : (
          "-"
        );
      },
    },
    // {
    //   title: "Location",
    //   dataIndex: "location",
    //   key: "location",
    //   render: (_, { user_location }) => {
    //     return user_location ? <span className="cap">{user_location}</span> : "-";
    //   },
    // },
    // {
    //   title: "Status",
    //   key: "is_active",
    //   filters: [
    //     {
    //       text: "Active",
    //       value: true,
    //     },
    //     {
    //       text: "Inactive",
    //       value: false,
    //     },
    //   ],
    //   render: (_, { is_active, _id }) => {
    //     let color = is_active ? "green" : "red";
    //     return (
    //       <a>
    //         <Tag
    //           // onClick={(e) =>
    //           //   showConfirm({
    //           //     record: _id,
    //           //     path: api.patient + "/status",
    //           //     onLoading: () => setLoading(true),
    //           //     onSuccess: () => setRefresh((prev) => !prev),
    //           //   })
    //           // }
    //           color={color}
    //           key={is_active}
    //         >
    //           {is_active ? "Active" : "Inactive"}
    //         </Tag>
    //       </a>
    //     );
    //   },
    // },
    {
      title: "Registered Date",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <>
              <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
                <Button
                  className="edit-cls btnStyle primary_btn"
                  onClick={() => {
                    setSelected(record._id);
                    form.setFieldsValue({
                        ...record,
                        state_id: record?.state_id?._id,
                        country_id: record.country_id?._id,
                        city_id: record?.city_id?._id,
                      mobileNumber: record.mobileNumber ? String(record.mobileNumber) : "",
                      });
                    getCountry({
                      countryData: (data) => setCountries(data),
                    });
                    if (record.state_id) {
                      getCity({
                        stateId: record?.state_id._id,
                        cityData: (record) => setCities(record),
                      });
                    }
                    if (record?.country_id) {
                      getState({
                        countryId: record?.country_id._id,
                        stateData: (record) => {
                          setStates(record);
                        },
                      });
                    }
                    // fetchbyAddress(record._id);
                    setVisible(true);
                  }}
                >
                  <i class="fas fa-edit"></i>
                  {/* <span>Edit</span> */}
                </Button>
              </Tooltip>
              <Tooltip
                title={"Activity Log"}
                color={"purple"}
                key={"activity user"}
              >
                <Button
                  className="btnStyle primary_btn"
                  onClick={(e) => activity(record.user_id)}
                >
                  <i className="fas fa-light fa-history"></i>
                </Button>
              </Tooltip>
              <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
                <Button
                  title="Delete"
                  className="delete-cls ail"
                  onClick={(e) => handleDeleteClick(record._id)}
                >
                  <i class="fa fa-light fa-trash"></i>
                  {/* <span>Delete</span> */}
                </Button>
              </Tooltip>
            </>
          </div>
        );
      },
    },
  ];

  const view = (id) => {
    navigate(`/patient/view/${id}`);
  };

  const handleChange = (value, data) => {
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data?.dialCode?.length),
    });
  };

  const [dialCode, setDialCode] = useState("");
  return (
    <>
      <Modal
        visible={showDelete}
        title="Confirm Delete"
        onCancel={handleDeleteCancel}
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" onClick={handleDeleteConfirm}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this record?</p>
      </Modal>

      <Row gutter={16}>
        <div className="float-end  w-100 text-right">
          <Button
            className="primary_btn btnStyle"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
        <div className="view-user-prouser-details">
        <h6>
          {doctor && !doctor.image ? (
            <Avatar
              style={{
                backgroundColor: "#00a2ae",
                verticalAlign: "middle",
              }}
              className="cap"
            >
              {doctor?.name?.charAt(0)}
            </Avatar>
          ) : (
            <Image className="image-radius" src={doctor?.image} />
          )}
        </h6>
     
        <div>
        <p className="mb-0">#{doctor?.uhid}</p>
          <span> {doctor?.name}</span>
        </div>
        </div>
      </Row>

      <Card
        className="mt-3 p-0"
        title="User Addresses"
        extra={
          <Button
            className="primary_btn btnStyle"
            onClick={handleAddAddressClick}
          >
            Add Address
          </Button>
        }
      >
        <h4 className="text-right mb-1 pt-0">
          TotalRecords: {address?.length}
        </h4>
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={AddressColumns}
                  dataSource={address}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
        <Modal
          visible={visible}
          title="Add Address"
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              Add
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
          <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input />
            </Form.Item>
             <Form.Item
        label="Mobile Number"
              name="mobileNumber"
        rules={[
                {
                  required: true,
                  validator: (rule, value) => {
                    if (!value) {
                      return Promise.reject("Please enter phone number");
                    }
                    if (!/^\d{10,15}$/.test(value)) {
                return Promise.reject(
                        "Phone number must be between 8 and 18 digits",
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

                  const countryCode = country?.dialCode || "";
                 console.log("Country Code:", countryCode);
                 setDialCode(countryCode) // Extract country code
                  handleChange(value, country); // Pass value and country code to the handleChange function
          }}
        />
      </Form.Item>
            <Form.Item
              name="building_no"
              label="Building No/House No./Street No."
              rules={[
                { required: true, message: "Please enter building number" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Area/Street/Sector/Village"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="default_address"
              label="Default Address"
              rules={[
                {
                  required: true,
                  message: "Please select an option",
                },
              ]}
            >
              <Select placeholder="Select an option">
                <Select.Option value="yes">Yes</Select.Option>
                <Select.Option value="no">No</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="save_as"
              label="Save As"
              rules={[
                {
                  required: true,
                  message: "Please select an option",
                },
              ]}
            >
              <Select placeholder="Select an option">
                <Select.Option value="home">Home</Select.Option>
                <Select.Option value="work">Work</Select.Option>
                <Select.Option value="hotel">Hotel</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="landmark"
              label="Landmark"
              rules={[{ required: true, message: "Please enter landmark" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="country_id"
              label="Country"
              rules={[{ required: true, message: "Please select country ID" }]}
            >
              <Select   showSearch
                style={{ width: "100%" }}
                onChange={handleSelectChange}
                placeholder="Select country"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }>
                {countries.map((country) => (
                  <Option key={country._id} value={country._id}>
                    {country.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

             {states?.length > 0 ?
                    ( <Col span={24} lg={24} sm={24} className="mt-2">
                      <Form.Item
                          label={"State" }
                        name="state_id"
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
                          name="city_id"
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
            {/* <Form.Item
              name="area"
              label="Area"
              rules={[{ required: true, message: "Please enter area" }]}
            >
              <Input />
            </Form.Item> */}
            <Form.Item
              name="pinCode"
              label="Pin Code"
              rules={[{ required: true, message: "Please enter pin code" }]}
            >
              <Input />
            </Form.Item>
         
          
          </Form>
        </Modal>
      </Card>

      <Card className="mt-3 p-0" title="Patients Added">
        <h4 className="text-right mb-1 pt-0">
          TotalRecords: {patients.length}
        </h4>
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={PatientColumns}
                  dataSource={patients}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </>
  );
}

export default View;
