import { Col, Form, Input, Modal, Row, Switch, Divider, Select } from "antd";
import { StarFilled } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const { TextArea } = Input;
const { Option } = Select;

const AddReviewRatingForm = ({
  api,
  show,
  hide,
  refresh,
  readOnly = false,
}) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ================= FETCH APPOINTMENTS =================
  useEffect(() => {
    if (!show) return;

    request({
      url: api.appointment + `/list`,
      method: "GET",
      onSuccess: (res) => {
        if (res.status) {
          setAppointments(res.data || []);
        }
      },
    });
  }, [show]);

  // ================= HANDLE APPOINTMENT CHANGE =================
  const handleAppointmentChange = (id) => {
    if (!id) {
      setSelectedAppointment(null);

      form.resetFields([
        "user_name",
        "email",
        "patient_name",
        "uhid",
        "appointment_id",
        "appointment_date",
        "appointment_time",
        "appointment_type",
      ]);

      return;
    }

    const appt = appointments.find((a) => a._id === id);
    setSelectedAppointment(appt);

    if (appt) {
      form.setFieldsValue({
        user_name: appt.user?.name || "",
        email: appt.user?.email || "",
        patient_name: appt.patient_details?.name || "",
        uhid: appt.patient_details?.uhid || "",
        appointment_id: appt.appointment_id || "",
        appointment_date: appt.appointment_date
          ? moment(appt.appointment_date).format("DD-MM-YYYY")
          : "",
        appointment_time: appt.appointment_time || "",
        appointment_type: appt.appointment_type || "",
      });
    }

    setRating(0);
    form.setFieldsValue({
      review: "",
      is_active: true,
    });
  };

  // ================= SUBMIT =================
  const onSubmit = (values) => {
    if (!rating) {
      ShowToast("Please select rating", Severty.ERROR);
      return;
    }

    setLoading(true);

    const payload = {
      type: "review",
      rating,
      review: values.review,
      is_active: values.is_active,
    };

    // Include appointment-related fields only if selected
    if (selectedAppointment) {
      payload.appointment_id = selectedAppointment._id;
      payload.user_id = selectedAppointment.user?._id;
      payload.patient_id = selectedAppointment.patient_details?._id;
    }

    request({
      url: api.addReview,
      method: "POST",
      data: payload,
      onSuccess: (res) => {
        setLoading(false);
        if (res.status) {
          ShowToast(res.message, Severty.SUCCESS);
          hide();
          refresh();
          form.resetFields();
          setRating(0);
          setSelectedAppointment(null);
        } else {
          ShowToast(res.message, Severty.ERROR);
        }
      },
      onError: (err) => {
        setLoading(false);
        ShowToast(
          err?.response?.data?.message || "Something went wrong",
          Severty.ERROR,
        );
      },
    });
  };

  // ================= STAR RENDER =================
  const renderStars = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 4, // spacing between stars
        }}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const isActive = index < rating;
          return (
            <StarFilled
              key={index}
              style={{
                color: isActive ? "#ffc107" : "#e4e5e9",
                cursor: readOnly ? "default" : "pointer",
                fontSize: 28,
                position: "relative",
                background: "transparent",
              }}
              onClick={() => !readOnly && setRating(index + 1)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      open={show}
      width={750}
      title="Add Review"
      onCancel={hide}
      okText="Submit"
      okButtonProps={{
        form: "reviewForm",
        htmlType: "submit",
        loading: loading,
        disabled: readOnly,
      }}
      centered
    >
      <Form id="reviewForm" form={form} layout="vertical" onFinish={onSubmit}>
        {/* ================= APPOINTMENT SELECT (OPTIONAL) ================= */}
        <Divider orientation="left">Select Appointment</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Appointment">
              <Select
                allowClear
                placeholder="Select appointment (optional)"
                onChange={handleAppointmentChange}
                value={selectedAppointment?._id}
              >
                {appointments.map((appt) => (
                  <Option key={appt._id} value={appt._id}>
                    {appt.appointment_id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* ================= USER INFO (VISIBLE ONLY IF APPOINTMENT SELECTED) ================= */}
        {selectedAppointment && (
          <>
            <Divider orientation="left">User Info</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="User Name" name="user_name">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            {/* ================= PATIENT INFO ================= */}
            <Divider orientation="left">Patient Info</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Patient Name" name="patient_name">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="UHID" name="uhid">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            {/* ================= APPOINTMENT INFO ================= */}
            <Divider orientation="left">Appointment Info</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Appointment ID" name="appointment_id">
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Date" name="appointment_date">
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Time" name="appointment_time">
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Type" name="appointment_type">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* ================= REVIEW & RATING ================= */}
        <Divider orientation="left">Review & Rating</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Rating" required>
              {renderStars()}
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Review"
              name="review"
              rules={[
                { required: true, message: "Please write a review" },
                { min: 3, message: "Review must be at least 3 characters" },
              ]}
            >
              <TextArea rows={4} placeholder="Write review..." />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Active Status"
              name="is_active"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddReviewRatingForm;
