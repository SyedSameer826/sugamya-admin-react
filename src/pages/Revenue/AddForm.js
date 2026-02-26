import { Col, Form, Image, Input, InputNumber, Modal, Radio, Row, Select } from "antd";
import  { useEffect, useState } from "react";

// import notfound from "../../assets/images/not_found.png";
// import SingleImageUpload from "../../components/SingleImageUpload";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
const { Option } = Select;

const AddForm = ({ section, api, show, hide, data, refresh }) => {

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  // const [country, setCountry] = useState([]);

  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
    setImage(data.image);
  }, [data]);

  const onCreate = (values) => {
    const { type, price, appointment_category } = values;
    console.log(values, "values");
    setLoading(true);
    const payload = {};
    payload.type = type;
    payload.price = price;
    payload.appointment_category = appointment_category;


    if (image?.length > 0) {
      payload.image = image
    }

    request({
      url: `${data ? api.appointmentPrice + "/" + data._id : api.appointmentPrice}`,
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
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? `Update` : `Add`}
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
          is_active: true
        }}
      >
        <h4 className="modal_title_cls">{data ? `Edit Type` : `Add New Type`}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={`Appointment Type`}
              name="type"
              rules={[
                {
                  required: true,
                  message: 'Type is required'
                },
                {
                  max: 50,
                  message: "Type should not contain more then 50 characters!",
                },
                {
                  min: 2,
                  message: "Type should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >

          <Select
          style={{ width: '100%' }}
          placeholder="Select Type"
          
        >
            <Option key={"New"} value={"New"}>New</Option>
            <Option key={"FOllow-up"} value={"Follow-up"}>Follow-up</Option>

        </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Appointment Category`}
              name="appointment_category"
              rules={[
                {
                  required: true,
                  message: 'Category is required'
                },
                {
                  max: 50,
                  message: "Category should not contain more then 50 characters!",
                },
                {
                  min: 2,
                  message: "Category should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >

          <Select
          style={{ width: '100%' }}
          placeholder="Select Category"
          
        >
            <Option key={"NA"} value={"NA"}>Not Assigned</Option>
            <Option key={"Rescheduled"} value={"Rescheduled"}>Reschedule</Option>
            <Option key={"Replacement"} value={"Replacement"}>Replacement</Option>
            <Option key={"LabReport"} value={"LabReport"}>Lab Report</Option>
            <Option key={"Emergency"} value={"Emergency"}>Emergency</Option>

        </Select>
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Base price"
              name="price"
              rules={[
                { required: true, message: "Missing the price!" },
                // { max: 7, message: "Price contain maximum 7 digits " },
              ]}>
              <InputNumber type="number" maxLength={10} autoComplete="off" placeholder="Enter Base price" />
            </Form.Item>
          </Col>


        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
