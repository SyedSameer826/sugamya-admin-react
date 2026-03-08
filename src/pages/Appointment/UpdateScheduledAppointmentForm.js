import { Col, Form, Modal, Row, Select, DatePicker, Input, Tag } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";

const { Option } = Select;

const UpdateScheduledAppointmentForm = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();

  const [loading, setLoading] = useState(false);
  const [slotsList, setSlotsList] = useState([]);
  const [slotTimings, setSlotTimings] = useState();
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [hoveredSlot, setHoveredSlot] = useState(null);

  /* -------------------- UPDATE APPOINTMENT -------------------- */
  const onCreate = (values) => {
    const payload = {
      slot_id: values?.appointment_time, // ✅ only slot _id
    };

    setLoading(true);

    request({
      url: `${apiPath.updateAppointmentSchedule}/${data._id}`,
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
      onError: (error) => {
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  /* -------------------- GET DOCTOR LIST -------------------- */
  const getDoctorList = () => {
    request({
      url: apiPath.doctors,
      method: "GET",
      onSuccess: (res) => {
        setDoctorList(res?.extras || []);
      },
    });
  };

  /* -------------------- GET SLOTS -------------------- */
  const getSlots = () => {
    console.log(
      "Fetching slots for date:",
      selectedDate,
      "and doctor_id:",
      form.getFieldValue("doctor_id"),
      form.getFieldValue("doctor_id")?.value,
      moment(selectedDate).format("YYYY-MM-DD"),
      moment(selectedDate).isValid(),
    );
    if (!selectedDate) return;
    let formattedDate = selectedDate;
    if (!moment(formattedDate).isValid()) {
      formattedDate = moment(selectedDate, [
        "DD-MM-YYYYTHH:mm:ss.SSSZ",
        "DD-MM-YYYY[T]HH:mm:ss.SSS[Z]",
        "DD-MM-YYYY",
      ]);
    }
    /*done*/
    let url = `${apiPath.slots}/${moment(formattedDate).format("YYYY-MM-DD")}`;
    if (form.getFieldValue("doctor_id")?.value) {
      url += `?doctor_id=${form.getFieldValue("doctor_id").value}`;
    }
    request({
      url: url,
      method: "GET",
      onSuccess: (res) => {
        setSlotsList(res?.data || []);
      },
    });
  };

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    console.log("Received data for editing:", data);
    if (data) {
      form.setFieldsValue({
        appointment_date: data.appointment_date
          ? moment(data.appointment_date)
          : moment(),
        appointment_time: data.appointment_time,
        doctor_id: {
          label: data?.doctor?.name,
          value: data?.doctor?._id,
        },
      });

      setSelectedDate(data.appointment_date || moment().format("YYYY-MM-DD"));
      setSlotTimings(data.appointment_time);
    }

    getDoctorList();
  }, [data]);

  /* -------------------- FETCH SLOTS ON CHANGE -------------------- */
  useEffect(() => {
    getSlots();
  }, [selectedDate, form.getFieldValue("doctor_id")?.value]);

  /* -------------------- HANDLE DATE CHANGE -------------------- */
  const handleDateChange = (date, dateString) => {
    const isoDate = `${dateString}T00:00:00.000Z`;
    setSelectedDate(isoDate);
    setSlotTimings(undefined);
    form.setFieldsValue({ appointment_time: undefined });
  };

  /* -------------------- HANDLE TIME -------------------- */
  const handleTime = (value) => {
    setSlotTimings(value);
  };

  /* -------------------- DISABLE DATE -------------------- */
  const disabledDate = (current) => {
    return (
      current &&
      (current < moment().startOf("day") ||
        current > moment().add(7, "days").endOf("day"))
    );
  };

  /* -------------------- UNIQUE SLOTS -------------------- */
  // const uniqueSlots = [
  //   ...new Set(
  //     slotsList.map((slot) => `${slot.slot_time_from}-${slot.slot_time_to}`),
  //   ),
  // ];

  return (
    <Modal
      open={show}
      width={750}
      okText="Save"
      onCancel={hide}
      okButtonProps={{
        form: "updateForm",
        htmlType: "submit",
        loading: loading,
        disabled: slotsList.length === 0,
      }}
      centered
    >
      <Form id="updateForm" form={form} onFinish={onCreate} layout="vertical">
        <h4>Edit Doctor Appointment </h4>

        <Row gutter={[16, 0]}>
          {/* DOCTOR SELECT */}
          {data?.doctor && (
            <Col span={24}>
              <Form.Item
                label="Select Doctor"
                rules={[{ required: true, message: "Please select a doctor!" }]}
              >
                <Input value={data?.doctor?.name} disabled />
              </Form.Item>
              {/* <Form.Item
              label="Select Doctor"
              name="doctor_id"
              rules={[{ required: true, message: "Please select a doctor!" }]}
            >
              <Select
                labelInValue
                placeholder="Select Doctor"
                showSearch
                optionFilterProp="label"
              >
                {doctorList.map((item) => {
                  const label = item?.name
                    ? item?.name
                    : item?.firstName
                      ? `${item.firstName} ${item.lastName}`
                      : "-";

                  return (
                    <Option key={item._id} value={item._id} label={label}>
                      {label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item> */}
            </Col>
          )}

          {/* DATE */}
          <Col span={24}>
            <Form.Item name="appointment_date" label="Select Date">
              <DatePicker
                format="DD-MM-YYYY"
                onChange={handleDateChange}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>

          {/* TIME */}
          <Col>
            <Form.Item
              name="appointment_time"
              label="Select Time"
              rules={[{ required: true, message: "Please select time" }]}
            >
              {slotsList.length === 0 ? (
                <div style={{ color: "#ff4d4f", padding: "8px 0" }}>
                  No slots available for selected date.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {slotsList.map((slot) => {
                    const formattedTime = moment(
                      slot.slot_time_from,
                      "HH:mm",
                    ).format("hh:mm A");

                    return (
                      <Tag.CheckableTag
                        className={
                          slotTimings === slot._id || hoveredSlot === slot._id
                            ? "ant-btn ant-btn-default btnStyle primary_btn"
                            : ""
                        }
                        key={slot._id}
                        onMouseEnter={() => setHoveredSlot(slot._id)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        checked={slotTimings === slot._id}
                        onChange={() => {
                          setSlotTimings(slot._id); // ✅ store slot _id
                          form.setFieldsValue({ appointment_time: slot._id });
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        {formattedTime}
                      </Tag.CheckableTag>
                    );
                  })}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UpdateScheduledAppointmentForm;
