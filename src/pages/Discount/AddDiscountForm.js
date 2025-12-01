import {
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";

import notfound from "../../assets/images/not_found.png";
import { TextInputBox } from "../../components/InputField";
import SingleImageUpload from "../../components/SingleImageUpload";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const userType = "Patient";

// export const DiscountTypes = {
//   DISH: "Dish",
//   VENDOR: "Vendor",
//   ALLVENDOR: "AllVendor",
// };

export const discountCategories = [
  { key: "festival", label: "Festival" },
  { key: "organization", label: "Organization" },
  { key: "user", label: "Particular User" },
];

export const DISCOUNT_AMOUNT_TYPES = [
  {
    name: "percentage",
    _id: "percentage",
  },
  {
    name: "flat",
    _id: "flat",
  },
];

const AddDiscountForm = ({ section, show, hide, data, refresh }) => {
  const api = {
    fc: apiPath.common.foodCategories,
    selectedFC: apiPath.common.selectedFoodCategories,
    items: apiPath.common.items,
    discount: apiPath.discount,
    patient: apiPath.common.users + "/patients" ,
  };

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  // const [discountFor, setDiscountFor] = useState(DiscountTypes.DISH);
  const [discountAmountType, setDiscountAmountType] = useState();
  const [startDate, setStartDate] = useState();

  const [patientList, setPatientList] = useState([]);

  const [discountCategory, setDiscountCategory] = useState();

  const [customLimitEnabled, setCustomLimitEnabled] = useState(false);
  const [discountFor,setDiscountFor] = useState("");


  const handleDiscountAmountTypeChange = (value) => {
    setDiscountAmountType(value.target.value);
  };

  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const handleImage = (data) => {
    if (data && data.length > 0) {
      setImage(data[0].url);
      console.log(data);
    }
  };

  const getPatientList = () => {
    request({
      url: api.patient,
      method: "GET",
      onSuccess: (data) => {
        setPatientList(data.data);
      },
    });
  };

  const handleDiscountCategory = (value) => {
    setDiscountCategory(value);
    console.log("sjnddskfsd<<<<<<<<<<<<<<<<<<<", discountCategories)
    if (value === discountCategories[1].key) {
      form.setFieldsValue({patient_id : []}) 
      getPatientList();
    }else if (value === discountCategories[2].key){
      form.setFieldsValue({patient_id : ""}) 
      getPatientList();
    }
  };

  const handleParent = (value) => {
   
  };

 

  const addNewDiscount = (values) => {
    console.log(discountFor, "hfjkdhgjkhjkfhgjgfh values");
    const payload = {
      ...values,
      amount: values.amount? values.amount: values.percentage,
      discount_for: discountFor,
      image: image,
    };
    request({
      url: data ? api.discount + `/${data._id}` : api.discount,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        // refresh();
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


  useEffect(() => {
    if (!data) return;
    let fields = {
      ...data,
      amount: data.amount,
      name: data.name,
      code: data.code,
      discount_type: data.discount_type,
      percentage: data.discount_type == "percentage"? data.amount: 0,
      amount: data.discount_type == "flat"? data.amount: 0,

      is_active: data.is_active,
      image: data.image,
      email_type: data.email_type,
      patient_id: data?.patient_id?.length ? data?.patient_id?.map((itm)=> itm) : data?.patient_id ,
      max_discount: data.max_discount,
      max_uses: data.max_uses,
      min_order_price: data.min_order_price,
      user_type: data.user_type,
      start_date: moment(data.start_date),
      end_date: moment(data.end_date),
      category: data.category,
    };

    form.setFieldsValue(fields);
    // if( data.patientDetails){

    //   setDiscountCategory("user");
    // }else if( data.email_type){

    //   setDiscountCategory("organization");
    // }

    setDiscountCategory(data?.category)
    setDiscountAmountType(data.discount_type);
    setCustomLimitEnabled(!!data?.max_uses);
    setImage(data.image);
    setDiscountFor(data.discount_for);
   if(data?.category === "user" || data?.category === "organization")  getPatientList();
  }, [data]);

  return (
    <Modal
      open={show}
      width={840}
      okText={data ? "Update" : "Add"}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        loading: loading,
        htmlType: "submit",
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <h4 className="modal_title_cls">
        {!!data ? "Edit" : "Add New"} {section}
      </h4>

      <Form id="create" form={form} onFinish={addNewDiscount} layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Upload Banner Image"
              rules={[
                {
                  validator: (_, value) => {
                    if (image) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Banner image is required"),
                    );
                  },
                },
              ]}
              name="thumbnail"
            >
              <SingleImageUpload
                value={image}
                fileType={FileType}
                imageType={"blog"}
                onChange={(data) => handleImage(data)}
              />
            </Form.Item>

            {
              <div className="mt-2">
                <Image width={120} src={image ? image : notfound}></Image>
              </div>
            }
          </Col>
          <TextInputBox
            label="Discount Name"
            name="name"
            placeholder="Enter Discount Name"
            rules={[
              {
                max: 250,
                message: "Name should contain more then 250 characters!",
              },
              {
                required: true,
                message: "Please Enter Discount Name",
              },
            ]}
          />
        </Row>

        <Row gutter={24}>
          <Col span={12}>
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
              <DatePicker
                onChange={(e) => setStartDate(moment(e).format("DD-MM-YYYY"))}
                placeholder="Select Start Date"
                disabledDate={(current) =>
                  current.isBefore(moment().subtract(1, "day"))
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date"
              name="end_date"
              rules={[
                {
                  required: true,
                  message: "Please select the end date",
                },
              ]}
              disabledDate={(current) =>
                current.isBefore(moment().subtract(1, "day"))
              }
            >
              <DatePicker
                placeholder="Select End Date"
                disabledDate={(current) =>
                  current.isBefore(moment().subtract(1, "day")) ||
                  current.isBefore(startDate)
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24} md={12}>
            <Row gutter={24}>
              <Col span={24} sm={24}>
                <div className="status_wrap">
                  <Form.Item
                    label="Discount For"
                    name="discount_for"
                    value={discountFor}
                  >
                    <Radio.Group onChange={(val) => setDiscountFor(val.target.value)}>
                      <Radio
                        value="appointment"
                        defaultChecked={discountFor === "appointment"}
                      >
                        Appointment
                      </Radio>
                      <Radio
                        value="medicine"
                        defaultChecked={discountFor === "medicine"}
                      >
                        Medicines
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>


        <Row gutter={24}>
          <Col span={24} md={12}>
            <Row gutter={24}>
              <Col span={24} sm={24}>
                <div className="status_wrap">
                  <Form.Item
                    label="Type"
                    name="discount_type"
                    value={discountAmountType}
                  >
                    <Radio.Group onChange={handleDiscountAmountTypeChange}>
                      <Radio
                        value="percentage"
                        defaultChecked={discountAmountType === "percentage"}
                      >
                        Percentage
                      </Radio>
                      <Radio
                        value="flat"
                        defaultChecked={discountAmountType === "flat"}
                      >
                        Flat
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Col>
          <Col span={24} md={12}>
            <div className="status_wrap">
              <Form.Item label="Status" name="is_active" className="mb-0">
                <Radio.Group>
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>De Active</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24} md={12}>
            <Form.Item
              name="percentage"
              label="Discount Percentage"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Enter Discount Percentage",
              //   },
              // ]}
            >
              <InputNumber
                maxLength={3}
                max={100}
                placeholder="10 %"
                disabled={discountAmountType === "flat"}
              />
            </Form.Item>
          </Col>

          <Col span={24} md={12}>
            <Form.Item
              name="amount"
              label={"Fix Discount Amount (USD)"}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Enter Discount Amount",
              //   },
              // ]}
            >
              <InputNumber
                maxLength={7}

                placeholder="Please Enter Discount Amount"
                disabled={discountAmountType === "percentage"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24} md={12}>
            <Form.Item
              name="category"
              label="Select the Category"
              rules={[
                {
                  required: true,
                  message: "Missing Category Selection",
                },
              ]}
            >
              <Select
                placeholder="Select Category"
                onChange={handleDiscountCategory}
              >
                {discountCategories.map((item, index) => (
                  <option key={item.key} value={item.key}>
                    <span className="cap">{item.label}</span>
                  </option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* {discountCategory === discountCategories[1].key || discountCategory === discountCategories[2].key && (
            <Col span={24} sm={12}>
              <Form.Item
                label="Email Type"
                name="email_type"
                rules={[
                  {
                    required: true,
                    message: "Please enter the email type of the organization!",
                  },
                  {
                    max: 50,
                    message:
                      "Email should not contain more then 50 characters!",
                  },
                  {
                    pattern: new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
                    message: "Enter a valid email address!",
                  },
                ]}
              >
                <Input autoComplete="off" placeholder="organization.com" />
              </Form.Item>
            </Col>
          )} */}

          {(discountCategory === discountCategories[1].key || discountCategory === discountCategories[2].key) && (
            <Col span={24} md={12}>
              <Form.Item
                name="patient_id"
                label="Select User"
                rules={[
                  {
                    required: true,
                    message: "Missing User Selection",
                  },
                ]}
              >
               <Select
  showSearch
  placeholder="Select User"
  onChange={handleParent}
  filterOption={(input, option) =>
    option?.label?.toLowerCase()?.includes(input.toLowerCase())
  }
  mode={discountCategory === discountCategories[2].key ? "single" : "multiple"}
  options={patientList.map((item) => ({
    value: item._id,
    label: item.uhid, // Use label for search filtering
  }))}
/>

              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={24}>
          <Col span={24} md={12}>
            <Form.Item
              label="Coupon Code"
              name="code"
              rules={[
                {
                  max: 7,
                  message: "Name should contain not more then 7 characters!",
                },
                {
                  required: true,
                  message: "Please Enter Coupon Code",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input placeholder="Enter Coupon Code" />
            </Form.Item>
          </Col>

          <Col span={24} md={12}>
            <Form.Item
              name="min_order_price"
              label="Minimum Subtotal Amount"
              rules={[
                {
                  required: true,
                  message: "Please Enter Min Subtotal Amount",
                },
              ]}
            >
              <InputNumber
                maxLength={10}
                placeholder="Enter Minimum Subtotal Amount"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24} md={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Please Enter Description",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input placeholder="Enter Description" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24} md={12}>
            <Form.Item
              name="max_discount"
              label="Max Discount"
              rules={[
                {
                  required: true,
                  message: "Please Enter Max Discount Amount",
                },
              ]}
            >
              <InputNumber
                maxLength={10}
                placeholder="Enter Max Discount Amount"
              />
            </Form.Item>
          </Col>

          <Col span={24} md={12}>
            <Form.Item
              name="max_uses"
              label="Max Number Of Uses In Total"
              rules={[
                {
                  required: true,
                  message: "Please Enter Max Number Of Uses In Total",
                },
              ]}
            >
              <InputNumber
                maxLength={10}
                placeholder="Enter Max Number Of Uses In Total"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddDiscountForm;
