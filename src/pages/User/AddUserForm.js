import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Radio,
  Image,
  Select,
  Checkbox,
} from "antd";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useRequest from "../../hooks/useRequest";
import SingleImageUpload from "../../components/SingleImageUpload";
import {
  EmailField,
  TextInputBox,
  SelectInput,
} from "../../components/InputField";

export const AddUserForm = ({ data, userType, show, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile: "",
    country_code: "",
  });
  // const [latLong, setlatLong] = useState({ lat: 30.5595, lng: 22.9375 });
  // const [location, setLocation] = useState();
  // const [userAddress, setUserAddress] = useState(null);

  const CheckboxGroup = Checkbox.Group;
  const plainOptions = [
    "Category Management",
    "Restaurant Management",
    "Discount Management",
    "Order Management",
    "Driver Management",
    "Promotion Management",
  ];
  const defaultCheckedList = ["Category Management"];
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const checkAll = plainOptions.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < plainOptions.length;
  const onChange = (list) => {
    setCheckedList(list);
  };

  const heading =
    (!!data ? "Edit" : "Add") +
    " " +
    (!!userType === "customer" ? "Customer" : "Sub-Admin");

  const handleChange = (value, data, event, formattedValue) => {
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile: value.slice(data.dialCode.length),
    });
  };

  return (
    <Modal
      width={750}
      visible={show}
      // title={heading}
      okText="Create"
      onCancel={onCancel}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">Add Sub-Admin</h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={24}>
            <Form.Item label={`Select City`}>
              <Select
                defaultValue="lucy"
                className="w-100"
                onChange={handleChange}
                options={[
                  {
                    value: "jack",
                    label: "Jack",
                  },
                  {
                    value: "lucy",
                    label: "Lucy",
                  },
                  {
                    value: "Yiminghe",
                    label: "yiminghe",
                  },
                  {
                    value: "disabled",
                    label: "Disabled",
                    disabled: true,
                  },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24} sm={24}>
            <div className="status_wrap w-100">
              <Form.Item name="is_active" className="w-100">
                <Radio.Group className="w-100">
                  <div className="row w-100 mx-0">
                    <div className="col-12 px-0">
                      <Radio value={true} className="">
                        Assign Role and Responsibilty
                      </Radio>
                      <div className="checkBoxOuter w-100">
                        <CheckboxGroup
                          className="w-100"
                          options={plainOptions}
                          value={checkedList}
                          onChange={onChange}
                        />
                      </div>
                    </div>
                    <div className="col-12 px-0">
                      <Radio value={false}>Create a Collector</Radio>
                      <div className="checkBoxOuter w-100">
                        <CheckboxGroup
                          className="w-100"
                          options={plainOptions}
                          value={checkedList}
                          onChange={onChange}
                        />
                      </div>
                    </div>
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>

          <Col span={24} sm={24}>
            <Form.Item label={`Email ID`} name="ar_name">
              <Input autoComplete="off" placeholder={`Enter Email Address`} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
