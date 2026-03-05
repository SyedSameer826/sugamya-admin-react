import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Image,
  message,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";
import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";
import apiPath from "../../../constants/apiPath";
import { TimePicker } from "antd";
const { Option } = Select;

const AddAppointment = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctorList] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const getDoctorList = () => {
    request({
      url: `${apiPath.doctors}`,
      method: "GET",
      onSuccess: (data) => {
        setDoctorList(data.extras);
      },
      onError: (err) => {},
    });
  };

  const onCreate = (values) => {
    const { appointment_id, preferred_time, doctor_id } = values;
    const payload = {
      appointmentId: appointment_id,
      preferedTime: preferred_time.format("HH:mm A"),
      assigned_doctor: doctor_id,
    };
    setLoading(true);

    request({
      url: `${api.addAppointment + "/dada" + data?._id}`,
      method: "PUT",
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

  useEffect(() => {
    getDoctorList();
  }, []);

  const now = moment();
  const currentHour = now.hour();
  const currentMinute = now.minute();

  const disabledHours = () => {
    const hours = [];
    for (let i = 0; i < currentHour; i++) {
      hours.push(i);
    }
    return hours;
  };

  const disabledMinutes = (selectedHour) => {
    const minutes = [];
    if (selectedHour === currentHour) {
      for (let i = 0; i < currentMinute; i++) {
        minutes.push(i);
      }
    }
    return minutes;
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
          <h4 className="modal_title_cls">{"Create Appointment"}</h4>
        </div>
        <Row gutter={[24, 0]}>
          <Col span={24} lg={12} sm={12} className="mt-2">
            <Form.Item
              label="Appointment ID"
              name="appointment_id"
              rules={[
                { required: true, message: "Please enter appointment ID!" },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message:
                    "Appointment ID can only contain letters, numbers, hyphens and underscores!",
                },
              ]}
            >
              <Input placeholder="Enter Appointment ID" autoComplete="off" />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12} className="mt-2">
            <Form.Item
              label="Preferred Time"
              name="preferred_time"
              rules={[
                { required: true, message: "Please select preferred time!" },
              ]}
            >
              <TimePicker
                use12Hours
                format="h:mm A"
                placeholder="Select Time"
                style={{ width: "100%" }}
                value={selectedTime}
                onChange={setSelectedTime}
                onSelect={(time) => {
                  if (!time) return;
                  const selectedHour = time.hour();
                  const selectedMinute = time.minute();

                  // Fix: Ensure a valid selection is made when switching to PM
                  if (selectedHour === 12 && selectedMinute === 0) {
                    const nextTime = moment().add(1, "hour").startOf("hour");
                    console.log(
                      "Fixing Default PM Selection:",
                      nextTime.format("h:mm a"),
                    );
                  }
                }}
                disabledTime={() => {
                  const todayName = moment().format("dddd");
                  const currentHour = moment().hour();
                  const currentMinute = moment().minute();

                  return {
                    disabledHours: () => [...Array(currentHour).keys()], // Disable past hours
                    disabledMinutes: (selectedHour) => {
                      if (selectedHour === undefined || selectedHour === -1) {
                        return [...Array(60).keys()]; // Disable all minutes if no hour is selected
                      }
                      if (selectedHour === currentHour) {
                        return [...Array(currentMinute + 1).keys()]; // Disable past minutes
                      }
                      return [];
                    },
                  };
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12} className="mt-2">
            <Form.Item
              label="Doctor"
              name="doctor_id"
              rules={[{ required: true, message: "Please select a doctor!" }]}
            >
              <Select
                showSearch
                placeholder="Select Doctor"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {doctors?.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAppointment;
