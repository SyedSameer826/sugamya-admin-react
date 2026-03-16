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
  Upload,
  TimePicker,
  InputNumber,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";

import "react-phone-input-2/lib/style.css";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const format = "h:mm a";
const { Option } = Select;

const weekdays = [
  { name: "sunday", label: "Sunday" },
  { name: "monday", label: "Monday" },
  { name: "tuesday", label: "Tuesday" },
  { name: "wednesday", label: "Wednesday" },
  { name: "thursday", label: "Thursday" },
  { name: "friday", label: "Friday" },
  { name: "saturday", label: "Saturday" },
];
const AddForm = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const { getState, getCity, getCountry } = useApi();

  const [imageUrl, setImageUrl] = useState();

  const [image, setImage] = useState();
  const [degree, setDegree] = useState();
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();

  const [cities, setCities] = useState();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });

  const [appointmentIds, setAppointmentIds] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, name: "Product 1" },
    { id: 2, name: "Product 2" },
    { id: 3, name: "Product 3" },
  ]);

  const [availableWorkingDays, setAvailableWorkingDays] = useState(weekdays);
  const [location, setLocation] = useState();
  const [allDoctors, setAllDoctors] = useState([]);
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
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data.dialCode.length),
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
      products: data.products,
      availability: updatedAvailability,
      appointmentId: data?.appointmentDetails?.appointment_id
        ? data?.appointmentDetails?.appointment_id
        : "",
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

    setImage(data.image);
    setDegree(data.degree);
    setFileData(data.document);
    setMobileNumber({
      mobile_number: data.mobile_number,
      country_code: data.country_code,
    });
  }, [data]);
  useEffect(() => {
    OnAppointList();
    OnProductList();
  }, []);

  const durations = [
    { value: "1 month", label: "1 month" },
    { value: "2 months", label: "2 months" },
    { value: "3 months", label: "3 months" },
    // Add more durations as needed
  ];

  const OnAppointList = () => {
    setLoading(true);
    request({
      url: apiPath.getAppointCart,
      method: "GET",
      onSuccess: (data) => {
        console.log(
          "check list apppppppppppppppppppppppppppppp",
          data.data.data,
        );
        setAppointmentIds(data.data.data);
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  console.log("appointIdsss", appointmentIds);
  const OnProductList = () => {
    request({
      url: apiPath.productList,
      method: "GET",
      onSuccess: (data) => {
        setProducts(data.data.data);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  // const onCreate = (values) => {
  //   // Handle form submission
  //   console.log('Received values:', values);
  // };
  const onCreate = (values) => {
    setLoading(true);
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<", values);
    if (!values?.products || !values?.products?.length) {
      return ShowToast("Please select atleast 1 product", Severty.ERROR);
    }

    const appId = data
      ? data?.appointmentDetails?.appointment_id === values.appointmentId
        ? data?.appointmentDetails?._id
        : values.appointmentId
      : values.appointmentId;
    const payload = {
      appointId: appId,
      products: values.products,
      duration: values.duration,
      // cartExpiry: "15", // Assuming this value is constant
    };

    // return console.log(payload,"payload")
    request({
      url: data ? `${apiPath.updateCartData}/${data._id}` : apiPath.addCart,
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
    getState({
      countryId: value,
      stateData: (data) => {
        setStates(data);
      },
    });
  };
  const handleStateChange = (value) => {
    getCity({
      stateId: value,
      cityData: (data) => setCities(data),
    });
  };

  const handleChangeLocation = (val) => {
    setLocation(val);
  };

  return (
    <Modal
      open={show}
      width={750}
      // okText={data ? "Update" : "Add"}
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
        initialValues={{
          dob: moment("1990-01-01", "DD-MM-YYYY"),
        }}
      >
        <div className="add_user_title">
          <h4 className="modal_title_cls">{`${
            data ? "Edit " : "Add "
          }Cart`}</h4>
        </div>
        <Row gutter={[16, 0]}>
          <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Appointment ID"
              name="appointmentId"
              rules={[
                {
                  required: true,
                  message: "Please select the appointment ID!",
                },
              ]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Appointment ID"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                // disabled={data ? true : false}
              >
                {appointmentIds.map((data, index) => (
                  <Option key={index} value={data._id}>
                    {data.appointment_id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "product_id"]}
                        fieldKey={[fieldKey, "product_id"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select a product!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a product"
                          style={{ width: "100%" }}
                        >
                          {products.map((product) => (
                            <Option key={product._id} value={product._id}>
                              {product.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "qty"]}
                        fieldKey={[fieldKey, "qty"]}
                        rules={[
                          {
                            required: true,
                            message: "Please enter a quantity!",
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Quantity"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button
                        className="delete-btn-modal-new"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  type="primary"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Product
                </Button>
              </>
            )}
          </Form.List>

          {/* <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Products"
              name="products"
              rules={[
                {
                  required: true,
                  message: "Please select the products!",
                },
              ]}
            >
              <Select
                mode="multiple"
                showSearch
                style={{ width: "100%" }}
                placeholder="Select Products"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {products.map((product) => (
                  <Option key={product.prodId} value={product._id}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
          <Col span={24} lg={24} sm={24} className="mt-2">
            <Form.Item
              label="Duration"
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Please select the duration!",
                },
              ]}
            >
              <InputNumber placeholder="Enter Duration" type="number" min={1} />
            </Form.Item>
          </Col>

          {/* <Col span={24} lg={24} sm={24} className="mt-2">
      <Form.Item
        label="Duration"
        name="duration"
        rules={[
          {
            required: true,
            message: "Please select the duration!",
          },
        ]}
      >
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Select Duration"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {durations.map((duration) => (
            <Option key={duration.value} value={duration.value}>
              {duration.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
