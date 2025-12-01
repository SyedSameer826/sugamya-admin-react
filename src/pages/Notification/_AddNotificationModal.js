import { Checkbox, Col, DatePicker, Form, Input, Modal, Radio, Row, Select } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";

const targetAudience = [
  { name: "Restaurants", label: "Restaurants" },
  { name: "Customers", label: "Customers" },
  { name: "Drivers", label: "Drivers" },
];

const loyalty = [
  { value: "0-100", label: "< 100" },
  { value: "100-500", label: "100 to 500" },
  { value: "500-10000", label: " > 500" },
];

const age_range = [
  { value: "0-15", label: "5 to 15" },
  { value: "15-25", label: "15 to 25" },
  { value: "25-50", label: "25 to 50" },
  { value: "50-70", label: "50 to 70" },
];

const professions = [
  "Software Developer",
  "Registered Nurse",
  "Accountant",
  "Teacher",
  "Electrician",
  "Graphic Designer",
  "Marketing Manager",
  "Doctor",
  "Sales Representative",
  "Human Resources Specialist"
];


const AddNotificationModal = ({ section, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [selectAudience, setSelectAudience] = useState();
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCity] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const debouncedSearchCity = useDebounce(searchCity, 300);

  const onCreate = (values) => {
    const payload = {
      ...values,
    };

    console.log(payload, "payload");

    setLoading(true);

    request({
      url: data ? apiPath.notification + "/" + data._id : apiPath.notification,
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

  const getCategory = () => {
    console.log();
    request({
      url: apiPath.common.restaurantCategories,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setCategories(data);
        }
        console.log(data, "data");
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getCountry = () => {
    request({
      url: `/country`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, 'Country');
        if (status) {
          setCountries(data)
        }
      },
    });
  };

  const getCity = (id) => {
    request({
      // url: `/city/${id}`,
      url: `/country-city/${id}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, 'city');
        if (status) {
          setCity(data)
        }
      },
    });
  };

  useEffect(() => {
    getCategory();
    getCountry()
    if (!!data) {
      form.setFieldsValue({
        ...data,
        start_date: moment(data.start_date),
        category_id: data.category_id?._id,
        country_id: data.country_id?._id,
        city_id: data.city_id?._id,
      }); 
      setSelectAudience(data.audience)

      getCity(data.country_id?._id)
    }
  }, []);

  return (
    <Modal
      width={750}
      open={show}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">
          {data ? "Edit Notification" : "Create Notification"}
        </h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={24} md={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  message: "Please Enter Notification Title",
                },
                {
                  max: 80,
                  message: "Title should not contain more then 80 characters!",
                },
                {
                  min: 2,
                  message: "Title should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input
                autoComplete="off"
                placeholder="Enter Notification Title"
              />
            </Form.Item>
          </Col>

          <Col span={24} sm={24} md={12}>
            <Form.Item
              label="Country"
              name="country_id"
              rules={[
                { required: true, message: "Please select the country!" },
              ]}
            >
              <Select
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                autoComplete="off" placeholder="Select Country" showSearch onChange={(value) => getCity(value)}>
                {
                  countries.map(item => <Select.Option key={item._id} label={item.name} value={item._id}>{item.name} </Select.Option>)
                }
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={24} md={12}>
            <Form.Item
              label="City"
              name="city_id"
              rules={[
                { required: true, message: "Please select the city!" },
              ]}
            >
              <Select
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder="Select City" showSearch
              // onChange={(value) => getCity(value)}
              >
                {
                  cities.map(item => <Select.Option key={item._id} label={item.name} value={item._id}>{item.name} </Select.Option>)
                }
              </Select>
            </Form.Item>
          </Col>

          <Col span={12} md={12}>
            <Form.Item
              label="Start Date"
              name="start_date"
              rules={[
                {
                  required: true,
                  message: "Please select the start date",
                },
              ]}
            >
              <DatePicker placeholder="Select Start Date" />
            </Form.Item>
          </Col>

          <Col span={24} sm={24} md={24}>
            <Form.Item
              name="audience"
              label="Select Audience"
              rules={[
                {
                  required: true,
                  message: "Please Select Audience",
                },
              ]}
            >
              <Select onChange={value => setSelectAudience(value)} placeholder="Select Audience" className="w-100">
                {targetAudience.map((item, index) => (
                  <option key={item.name} value={item.name}>
                    <span className="cap">{item.label}</span>
                  </option>
                ))
                }
              </Select>
            </Form.Item>
          </Col>

          {
            selectAudience == "Restaurants" &&
            <Col span={24} sm={24} md={24}>
              <Form.Item
                name="category_id"
                label="Select Category"
                rules={[
                  {
                    required: true,
                    message: "Please Select Category",
                  },
                ]}
              >
                <Select placeholder="Select Category" className="w-100">
                  {categories.map((item, index) => (
                    <option key={item.name} value={item._id}>
                      <span className="cap">{item.name}</span>
                    </option>
                  ))
                  }
                </Select>
              </Form.Item>
            </Col>
          }

          {
            selectAudience == "Customers" &&
            <>
              <Col span={24} sm={24} md={24}>
                <Form.Item
                  name="is_continue"
                  label="Didn't order for more than 1 week"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Category",
                    },
                  ]}
                >
                  <Radio.Group >
                    <Radio value={true}> Continue</Radio>
                    <Radio value={false}> Stop</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={24} sm={12} md={12}>
                <Form.Item
                  name="loyalty_point"
                  label="Who have loyalty points"
                  rules={[
                    {
                      required: true,
                      message: "Please Select loyalty",
                    },
                  ]}
                >
                  <Select placeholder="Select loyalty" className="w-100">
                    {loyalty.map((item, index) => (
                      <option key={item.value} value={item.value}>
                        <span className="cap">{item.label}</span>
                      </option>
                    ))
                    }
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24} sm={12} md={12}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Gender",
                    },
                  ]}
                >
                  <Select placeholder="Select Gender" className="w-100">
                    <Select.Option value="M"> Male</Select.Option>
                    <Select.Option value="F"> Female </Select.Option>
                    <Select.Option value="Both"> Both</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24} sm={12} md={12}>
                <Form.Item
                  name="age_range"
                  label="Age Range"
                  rules={[
                    {
                      required: true,
                      message: "Please Age Range",
                    },
                  ]}
                >
                  <Select placeholder="Age Range" className="w-100">
                    {age_range.map((item, index) => (
                      <option key={item.value} value={item.value}>
                        <span className="cap">{item.label}</span>
                      </option>
                    ))
                    }
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24} sm={12} md={12}>
                <Form.Item
                  name="profession"
                  label="Profession"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Profession",
                    },
                  ]}
                >
                  <Select placeholder="Select Profession" className="w-100">
                    {
                      professions.map((item, index) => <option key={index} value={item}> {item}</option>)
                    }
                  </Select>
                </Form.Item>
              </Col>
            </>
          }

          <Col span={24} sm={24} md={12}>
            <Form.Item
              label="Notification English"
              name="message"
              rules={[
                {
                  required: true,
                  message: "Please Enter Notification Message",
                },
                {
                  max: 80,
                  message:
                    "Message should not contain more then 80 characters!",
                },
                {
                  min: 2,
                  message: "Message should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input
                autoComplete="off"
                placeholder="Enter Notification Message"
              />
            </Form.Item>
          </Col>

          <Col span={24} sm={24} md={12}>
            <Form.Item
              label="Notification Arabic"
              name="ar_message"
              rules={[
                {
                  required: true,
                  message: "Please Enter Notification Message in arabic",
                },
                {
                  max: 80,
                  message:
                    "Message should not contain more then 80 characters!",
                },
                {
                  min: 2,
                  message: "Message should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input
                autoComplete="off"
                placeholder="Enter Arabic Notification Message"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddNotificationModal;
