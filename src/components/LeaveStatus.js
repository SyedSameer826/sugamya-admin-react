import React, { useState } from "react";
import { Modal, Select, Input, Button, Form, message } from "antd";
import useRequest from "../hooks/useRequest";
import { Severty, ShowToast } from "../helper/toast";

const { Option } = Select;
const { TextArea } = Input;

const StatusModal = ({ visible, onClose, onSubmit, leaveId, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          request({
            url: `/admin/leave/status/${leaveId}`,
            method: "POST",
            data: {
              leaveId: leaveId,
              leaveStatus: values.status,
              message: values.message,
            },
            onSuccess: (data) => {
              if(!data.status) return ShowToast("Something went Wrong!", Severty.ERROR);
              refresh()
            },
          });
          message.success("Status updated successfully");
          onSubmit(values.status, values.message);
          onClose();
          form.resetFields();
        } catch (error) {
          message.error("Failed to update status");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Update Status"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="status_form"
        initialValues={{
          status: "",
          reason: "",
        }}
      >
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select placeholder="Select a status">
            <Option value="Approved">Approve Leave</Option>
            <Option value="Rejected">Reject Leave</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Please provide a message" }]}
        >
          <TextArea rows={4} placeholder="Enter message" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StatusModal;
