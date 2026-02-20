import { Col, Form, Input, Modal, Row, Switch, Divider } from "antd";
import { StarFilled } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const { TextArea } = Input;

const ReviewForm = ({ api, show, hide, data, refresh, readOnly = false }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  // Populate form with data
  useEffect(() => {
    if (!data) return;

    form.setFieldsValue({
      review: data?.review || "",
      is_active: data?.is_active ?? true,
    });

    setRating(Number(data?.rating) || 0);
  }, [data, form]);

  const onSubmit = (values) => {
    if (readOnly) return; // prevent submitting in read-only mode

    setLoading(true);

    const payload = {
      rating,
      review: values.review,
      is_active: values.is_active,
    };

    request({
      url: `${api.addEdit + "/" + data._id}`,
      method: "PUT",
      data: payload,
      onSuccess: (res) => {
        setLoading(false);
        if (res.status) {
          ShowToast(res.message, Severty.SUCCESS);
          hide();
          refresh();
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

  // Helper to render stars
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
      title={data ? "Edit Review" : "Add Review"}
      onCancel={hide}
      okText={data ? "Update" : "Submit"}
      okButtonProps={{
        form: "reviewForm",
        htmlType: "submit",
        loading: loading,
        disabled: readOnly,
      }}
      centered
    >
      <Form id="reviewForm" form={form} layout="vertical" onFinish={onSubmit}>
        {/* ========== USER INFO ========== */}
        <Divider orientation="left">User Info</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="User Name">
              <Input value={data?.user_id?.name} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email">
              <Input value={data?.user_id?.email} disabled />
            </Form.Item>
          </Col>
        </Row>

        {/* ========== PATIENT INFO ========== */}
        <Divider orientation="left">Patient Info</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Patient Name">
              <Input value={data?.patient_id?.name} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="UHID">
              <Input value={data?.patient_id?.uhid} disabled />
            </Form.Item>
          </Col>
        </Row>

        {/* ========== APPOINTMENT INFO ========== */}
        <Divider orientation="left">Appointment Info</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Appointment ID">
              <Input value={data?.appointments?.appointment_id} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Date">
              <Input
                value={
                  data?.appointments?.appointment_date
                    ? moment(data.appointments.appointment_date).format(
                        "DD-MM-YYYY",
                      )
                    : ""
                }
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ========== REVIEW & RATING ========== */}
        <Divider orientation="left">Review & Rating</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Rating" required>
              <div>{renderStars()}</div>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Review"
              name="review"
              rules={[
                { required: !readOnly, message: "Please write a review" },
                { min: 3, message: "Review must be at least 3 characters" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Write review..."
                disabled={readOnly}
              />
            </Form.Item>
          </Col>

          {!readOnly && (
            <Col span={12}>
              <Form.Item
                label="Active Status"
                name="is_active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
