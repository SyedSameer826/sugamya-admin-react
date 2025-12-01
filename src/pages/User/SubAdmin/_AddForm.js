import { Col, Form, Input, Modal, Checkbox, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";

const SUB_ADMIN_TYPES = [
  { label: "Logistics", key: "Logistics" , name : "Logistics"},
  { label: "Tele-Counsellors", kay: "Tele-Counsellors" , name : "Support" },
];

const AddForm = ({ setEmail, api, show, hide, selected, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [isCollector, setIsCollector] = useState(
    selected ? selected.is_collector : false,
  );
  const [country, setCountry] = useState([]);
  const [city, setCity] = useState([]);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });
  const [selectedOptions, setSelectedOptions] = useState(null);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedOptions(checkedValues);
  };
  const getCountry = () => {
    request({
      url: `/country`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, "Country");
        if (status) {
          setCountry(data);
        }
      },
    });
  };

  const handleChange = (value, data) => {
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data.dialCode.length),
    });
  };

  const getCity = (id) => {
    request({
      url: `/country-city/${id}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, "city");
        if (status) {
          setCity(data);
        }
      },
    });
  };

  const onCreate = (values) => {
    const { permission } = values;
    const payload = {
      ...values,
      is_collector: isCollector,
    };

    payload.mobile_number = mobileNumber.mobile_number;
    payload.country_code = mobileNumber.country_code;
    payload.gender = selectedOptions;

    if (!permission) {
      payload.permission = [];
    }

    console.log(payload, "payload");
    setLoading(true);

    request({
      url: `${selected ? api.subAdmin + "/" + selected._id : api.subAdmin}`,
      method: selected ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);

          if (selected) {
            refresh();
          } else {
            refresh();
            setEmail(payload.email);
          }
          hide();
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

  useEffect(() => {
    getCountry();
  }, []);

  useEffect(() => {
    if (!selected) return;

    form.setFieldsValue({
      ...selected,
      country_id: selected.country_id?._id,
      city_id: selected.city_id?._id,
      mobile: selected.country_code
        ? selected.country_code + selected.mobile_number
        : "",
      gender: selectedOptions,
    });
    setIsCollector(selected.is_collector);
    getCity(selected.country_id?._id);
    setSelectedOptions(selected.gender);
    setMobileNumber({
      mobile_number: selected.mobile_number,
      country_code: selected.country_code,
    });
  }, [selected]);

  const options = [
    { label: "Female", value: "female" },
    { label: "Male", value: "male" },
    { label: "Other", value: "other" },
  ];

  return (
    <Modal
      width={780}
      open={show}
      okText={selected ? "Update" : "Create"}
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
          {selected ? "Edit" : "Add"} Sub-Admin
        </h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  max: 20,
                  message: "Name should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
                {
                  required: true,
                  message: "Please enter name",
                },
                {
                  pattern: /^[A-Za-z\s]+$/, // Regex to allow only letters and spaces
                  message: "Name should only contain letters and spaces!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Name`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label="Email Id"
              name="email"
              rules={[
                { required: true, message: "Please enter the email!" },
                {
                  max: 50,
                  message: "Email should not contain more then 50 characters!",
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

          <Col span={24} sm={12}>
            <Form.Item
              label="User Type"
              name="type"
              rules={[
                { required: true, message: "Please select the user type!" },
              ]}
            >
              <Select
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Select user type"
                showSearch
              >
                {SUB_ADMIN_TYPES.map((item) => (
                  <Select.Option
                    key={item.key}
                    label={item.name}
                    value={item.label}
                  >
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
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
                        "Phone number must be between 8 and 12 digits",
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
                    return "Invalid value: " + value + ", " + country.name;
                  } else if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country.name;
                  } else {
                    return true;
                  }
                }}
                country={"ca"}
                preferredCountries={["ps", "il"]}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>
          <Col span={24} lg={12} sm={12} className="flagMobileNumber">
            <Form.Item label="Gender" name="gender">
              {options.map((option) => (
                <Checkbox
                  key={option.value}
                  checked={selectedOptions === option.value}
                  onChange={(e) =>
                    handleCheckboxChange(e.target.checked ? option.value : null)
                  }
                >
                  {option.label}
                </Checkbox>
              ))}
            </Form.Item>
          </Col>
          <Col span={24} lg={12} sm={12} className="flagMobileNumber">
            <Form.Item
              label="Address"
              name="location"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea placeholder="Enter Address" rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
