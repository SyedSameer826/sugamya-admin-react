import {
  Col,
  Form,
  Modal,
  Row,
  Select,
  DatePicker,
  Input,
  Upload,
  Button,
  TimePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import moment from "moment";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";
const format = "h:mm a";
const { Option } = Select;

const AddAppointmentForm = ({ show, hide, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();

  const [loading, setLoading] = useState(false);
  const [patientList, setPatientList] = useState([]);
  const [slotsList, setSlotsList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [priceReadOnly, setPriceReadOnly] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  // -------------------- GET PATIENTS --------------------
  const getPatientList = () => {
    setPatientLoading(true);

    request({
      url: apiPath.listPatient + "?page=1&pageSize=50",
      method: "GET",
      onSuccess: (data) => {
        setPatientList(data?.data?.docs || []);
        setPatientLoading(false);
      },
      onError: () => {
        setPatientLoading(false);
      },
    });
  };

  // -------------------- CALCULATE AMOUNT --------------------
  const getCalculatedAmount = (patientId, reportAwaited = false) => {
    if (!patientId) return;
    if (reportAwaited) {
      form.setFieldsValue({ price: 0 });
      return;
    }
    setPriceReadOnly(true);
    form.setFieldsValue({ price: undefined });

    request({
      url: apiPath.calculatedAmount,
      method: "POST",
      data: { patient_id: patientId },
      onSuccess: (data) => {
        if (data?.status === true) {
          form.setFieldsValue({ price: data.Amount });
        } else {
          setPriceReadOnly(false);
          ShowToast(data?.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        if (error?.response?.status === 409) {
          ShowToast(error?.response?.data?.message, Severty.ERROR);
          setPriceReadOnly(true);
        } else {
          ShowToast(
            error?.response?.data?.message || "Something went wrong",
            Severty.ERROR,
          );
          setPriceReadOnly(false);
        }
        form.setFieldsValue({ price: undefined });
      },
    });
  };

  // -------------------- GET SLOTS --------------------
  const getSlots = (date) => {
    if (!date) return;

    request({
      url: `${apiPath.slots}/${date}`,
      method: "GET",
      onSuccess: (data) => {
        setSlotsList(data?.data || []);
      },
      onError: () => {
        setSlotsList([]);
      },
    });
  };

  // -------------------- UPLOAD DOCUMENTS --------------------
  const uploadDocuments = async () => {
    if (!fileList.length) return [];

    const uploadPromises = fileList.map((file) => {
      const formData = new FormData();
      formData.append("file", file.originFileObj);

      return new Promise((resolve, reject) => {
        request({
          url: apiPath.fileUpload,
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
          onSuccess: (data) => {
            resolve(data.upload); // backend returns { upload: "path" }
          },
          onError: (error) => {
            ShowToast(
              error?.response?.data?.message || "File upload failed",
              Severty.ERROR,
            );
            reject(error);
          },
        });
      });
    });

    return Promise.all(uploadPromises);
  };

  // -------------------- CREATE APPOINTMENT --------------------
  const onCreate = async (values) => {
    try {
      setLoading(true);

      // Upload documents first
      const uploadedDocs = await uploadDocuments();

      // Prepare appointment payload
      const payload = {
        patientId: values.patientId,
        document: uploadedDocs,
        description: values.description || "",
        price: Number(values.price) || 0,
        discount_code: values.discount_code || "",
        appointment_category: "NA",
        slotId: values.slotId,
        preferredTime: values?.appointment_time
          ? moment(values.appointment_time).format("HH:mm")
          : null,
        user_id: selectedPatient?.added_by,
      };

      // Submit appointment
      request({
        url: apiPath.addAppointment,
        method: "POST",
        data: payload,
        headers: { "Content-Type": "application/json" },
        onSuccess: (data) => {
          setLoading(false);
          if (data.status) {
            ShowToast(data.message, Severty.SUCCESS);
            form.resetFields();
            setFileList([]);
            setPriceReadOnly(false);
            hide();
            refresh();
          } else {
            ShowToast(data.message, Severty.ERROR);
          }
        },
        onError: (error) => {
          setLoading(false);
          ShowToast(error?.response?.data?.message, Severty.ERROR);
        },
      });
    } catch (error) {
      setLoading(false);
    }
  };

  // -------------------- DATE CHANGE --------------------
  const handleDateChange = (date) => {
    if (!date) return;
    const formattedDate = `${date.format("YYYY-MM-DD")}T00:00:00.000Z`;
    form.setFieldsValue({ slotId: undefined });
    getSlots(formattedDate);
  };

  // -------------------- DISABLE DATE --------------------
  const disabledDate = (current) => {
    return (
      current &&
      (current < moment().startOf("day") ||
        current > moment().add(7, "days").endOf("day"))
    );
  };

  // -------------------- UPLOAD CONFIG --------------------
  const uploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
  };

  // -------------------- MODAL OPEN --------------------
  useEffect(() => {
    if (show) {
      getPatientList();

      const today = moment();
      const formattedDate = `${today.format("YYYY-MM-DD")}T00:00:00.000Z`;

      form.setFieldsValue({
        appointmentDate: today,
        price: undefined,
        patientId: undefined,
        slotId: undefined,
      });

      setFileList([]);
      setPriceReadOnly(false);
      getSlots(formattedDate);
    }
  }, [show]);

  return (
    <Modal
      open={show}
      width={700}
      okText="Add"
      onCancel={hide}
      okButtonProps={{
        form: "appointmentForm",
        htmlType: "submit",
        loading,
      }}
      centered
    >
      <Form
        id="appointmentForm"
        form={form}
        layout="vertical"
        onFinish={onCreate}
      >
        <h3>Add Appointment</h3>

        <Row gutter={16}>
          {/* Patient */}
          <Col span={24}>
            <Form.Item
              label="Select Patient"
              name="patientId"
              rules={[{ required: true, message: "Please select a patient!" }]}
            >
              <Select
                placeholder="Select Patient"
                showSearch
                loading={patientLoading}
                notFoundContent={
                  patientLoading ? "Loading patients..." : "No patients"
                }
                onChange={(value) => {
                  const patient = patientList.find((p) => p._id === value);
                  setSelectedPatient(patient);

                  if (
                    patient?.latest_appointment_status &&
                    patient.latest_appointment_status == "ReportAwaited"
                  ) {
                    getCalculatedAmount(value, true);
                  } else {
                    getCalculatedAmount(value);
                  }
                }}
              >
                {patientList.map((patient) => (
                  <Option key={patient._id} value={patient._id}>
                    {patient.name ||
                      `${patient.firstName || ""} ${patient.lastName || ""}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {selectedPatient?.latest_appointment_status &&
          selectedPatient.latest_appointment_status == "ReportAwaited" ? (
            <Col>
              <Form.Item
                className="qty-cls "
                label="Select Time"
                style={{ minWidth: "180px" }}
                name="appointment_time"
                rules={[{ required: true, message: "Please select time!" }]}
              >
                <TimePicker
                  format={format}
                  use12Hours
                  placeholder="Select Time"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          ) : (
            <>
              {/* Date */}
              <Col span={12}>
                <Form.Item
                  label="Select Date"
                  name="appointmentDate"
                  rules={[{ required: true, message: "Please select date!" }]}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    onChange={handleDateChange}
                    disabledDate={disabledDate}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              {/* Slot */}
              <Col span={12}>
                <Form.Item
                  label="Select Slot"
                  name="slotId"
                  rules={[{ required: true, message: "Please select a slot!" }]}
                >
                  <Select placeholder="Select Slot">
                    {slotsList.length > 0 ? (
                      slotsList.map((slot) => (
                        <Option key={slot._id} value={slot._id}>
                          {moment
                            .utc(slot.slot_time_from, "HH:mm")
                            .local()
                            .format("hh:mm A")}
                        </Option>
                      ))
                    ) : (
                      <Option disabled>No slots available</Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>

              {/* Description */}
              <Col span={24}>
                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
              {/* Discount Code */}
              <Col span={12}>
                <Form.Item label="Discount Code" name="discount_code">
                  <Input />
                </Form.Item>
              </Col>

              {/* Upload */}
              <Col span={24}>
                <Form.Item label="Upload Documents">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </>
          )}

          {/* Price */}
          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price is required!" }]}
            >
              <Input
                type="number"
                readOnly={priceReadOnly}
                placeholder="Auto calculated price"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAppointmentForm;
