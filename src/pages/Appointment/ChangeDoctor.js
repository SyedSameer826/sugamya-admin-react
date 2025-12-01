import { Col, Form, InputNumber, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";

const ChangeDoctor = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);

  const [doctorList, setDoctorList] = useState([]);

  const onCreate = (values) => {
    const { type, price } = values;
    console.log(values, "values");
    setLoading(true);
    const payload = {};
    payload.type = type;
    payload.price = price;

    if (image?.length > 0) {
      payload.image = image;
    }

    request({
      url: `${
        data ? api.appointmentPrice + "/" + data._id : api.appointmentPrice
      }`,
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

  const getDoctorList = () => {
    request({
      url: apiPath.common.doctors,
      method: "GET",
      onSuccess: (data) => {
        setDoctorList(data.data);
      },
      onError: (err) => {},
    });
  };

  useEffect(() => {
    getDoctorList();
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setFile([data.image]);
    setImage(data.image);
  }, [data]);

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? `Save` : `Add`}
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
          is_active: true,
        }}
      >
        <h4 className="modal_title_cls">
          {data ? `Assign Doctor` : `Add New Appointment`}
        </h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={24}>
            <Form.Item
              label="Select Doctor"
              name="doctor_id"
              rules={[{ required: true, message: "Please select a doctor!" }]}
            >
              <Select
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Select Doctors"
                showSearch
              >
                {doctorList?.map((item) => (
                  <Select.Option
                    key={item?._id}
                    label={item?.name}
                    value={item?._id}
                  >
                    <span>{item?.name}</span>
                    {/* <span>{item?.is_head_doctor ? " (Head Doctor)" : ""}</span>
                    <span>
                      {item?.specialty && " ( " + item?.specialty + " )"}
                    </span> */}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/*  show the availability of doctor */}
          {/* reschedule appointment as per availability (date + time) */}
        </Row>
      </Form>
    </Modal>
  );
};

export default ChangeDoctor;
