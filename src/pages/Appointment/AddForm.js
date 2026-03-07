import { Col, Form, TimePicker, Modal, Row, Select, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";
import { IstConvert } from "../../helper/functions";
const format = "h:mm a";
const { Option } = Select;

const AddForm = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [file, setFile] = useState([]);
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const [slotsList, setSlotsList] = useState([]);
  const [slotTimings, setSlotTimings] = useState();
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const isLabReport = data?.appointment_category === "LabReport";

  const onCreate = (values) => {
    console.log(values, "appointment time??????")

    let appointmentTime;
    if (isLabReport) {
      // For lab report, convert TimePicker moment to UTC HH:mm
      appointmentTime = moment(values.appointment_time).utc().format("HH:mm");
    } else {
      appointmentTime = slotTimings;
    }

    let payload = {
      ...values,
      appointment_time: appointmentTime
    }
    setLoading(true)
    request({
      url: apiPath.appointment + "/" + data._id,
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
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  const getDoctorList = () => {
    if (isLabReport) {
      // For lab report, fetch all doctors without slot/time filter
      request({
        url: apiPath.doctors,
        method: "GET",
        onSuccess: (data) => {
          setDoctorList(data.extras);
        },
        onError: (err) => {},
      });
      return;
    }
    if(!selectedDate || !slotTimings) return;
    request({
      url: `${apiPath.doctors}?date=${selectedDate}&time=${slotTimings.split("-")[0]}`,
      method: "GET",
      onSuccess: (data) => {
        setDoctorList(data.extras);
      },
      onError: (err) => {},
    });
  };

  useEffect(() => {
    if (data) {
      if (isLabReport) {
        // For lab report, set today's date and use TimePicker moment value
        const todayDate = moment().format("YYYY-MM-DD") + "T00:00:00.000Z";
        form.setFieldsValue({
          appointment_date: moment(new Date()),
          appointment_time: data.appointment_time ? moment.utc(data.appointment_time, "HH:mm").local() : null,
          doctor_id: data.doctor_id,
        });
        setSelectedDate(todayDate);
      } else {
        const timeInLocal = moment.utc(data.appointment_time, "HH:mm").local();

        let appointment_time = (timeInLocal).format("hh:mm A");
        let timePart = data.appointment_time? data?.appointment_time?.split("T")[1]?.split(":"): [];
        let hours = timePart?.[0];
        let minutes = timePart?.[1];

        // Combine hours and minutes in 24-hour format
        // const formattedTime = `${hours}:${minutes}`;
        const formattedTime = data.appointment_time;
        if(data.appointment_time){

          setSlotTimings(formattedTime);
        }
        form.setFieldsValue({
          appointment_date: data.appointment_date? moment(data.appointment_date): moment(new Date()), // Assuming data.appointment_date is in a suitable format
          appointment_time: appointment_time, // Assuming data.appointment_time is already formatted
          doctor_id: data.doctor_id,
          // Set other form fields here based on the data object
        });
        setSelectedDate(data.appointment_date?data.appointment_date: moment(new Date()));
      }
    } else {
      setSelectedDate(moment(new Date()));
    }
  }, [data]); // Add form dependency to useEffect dependency array

  useEffect(() => {
    if (isLabReport) {
      // For lab report, only fetch all doctors (no slots needed)
      getDoctorList();
    } else {
      handleChange();
      getDoctorList();
    }
  }, [selectedDate, slotTimings]);

  const handleChange = () => {
    request({
      url: apiPath.slots + `/${selectedDate}`,
      method: "GET",
      onSuccess: (data) => {
        setSlotsList(data.data);
      },
      onError: (err) => {},
    });
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(`${dateString}T00:00:00.000Z`);
    setSlotTimings(); // Reset slot timings when date changes
    console.log("Selected Date:", dateString);
    // form.setFieldsValue({
    //   appointment_date: dateString, // Update the form field with the selected date 
    // });
    handleChange();
    // getDoctorList();
    // Update the state with the selected date string
  };

  const disabledDate = (current) => {
    // Can not select days before 48 hours from now and after 7 days from now
    return (
      current &&
      (current < moment().add(1, "hours").startOf("day") ||
        current > moment().add(7, "days").endOf("day"))
    );
  };

  const handleTime = (slot) => {
    setSlotTimings(slot);
    // getDoctorList();
    const selectedSlot = slotsList.filter(
      (slotss) => slotss.slot_time_from == slot,
    );
    console.log("Selected slot:", doctorList);
    var additional = [];
    // let updatedDoctorList = [...doctorList];

    // selectedSlot.forEach(slot => {
    //     const docSlots = doctorList.filter(doc => doc._id === slot.doctor_id);
    //     updatedDoctorList = [...docSlots];
    // });

    setDoctorList(doctorList);
  };

  function convertToIST(time) {
    // Parse the original time
    const [hours, minutes] = time.split(":").map(Number);

    // Indian Standard Time (IST) offset
    const IST_offset_hours = 5;
    const IST_offset_minutes = 30;

    // Add IST offset
    let IST_hours = hours + IST_offset_hours;
    let IST_minutes = minutes + IST_offset_minutes;

    // Adjust if minutes exceed 60
    if (IST_minutes >= 60) {
      IST_hours += 1;
      IST_minutes -= 60;
    }

    // Adjust if hours exceed 24
    IST_hours %= 24;

    // Format IST time
    return `${String(IST_hours).padStart(2, "0")}:${String(
      IST_minutes,
    ).padStart(2, "0")}`;
  }

  const uniqueSlots = new Set();
  console.log(slotsList.length, "length>>>>>>>>>");
  // Populate the Set with unique time slots
  slotsList.forEach((slot) => {
    const IST_slot_time_from = slot.slot_time_from;
    const IST_slot_time_to = slot.slot_time_to;

    console.log(IST_slot_time_to, "IST_slot_time_to>>>>");
    // Construct slot string in IST format
    const slotString = `${IST_slot_time_from}-${IST_slot_time_to}`;

    // Add the slot string to the Set
    uniqueSlots.add(slotString);
  });

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
        <h4 className="modal_title_cls">{`Assign Doctor`}</h4>
        <Row gutter={[16, 0]}>
          <Col>
            <Form.Item
              className="qty-cls "
              style={{ minWidth: "180px" }}
              name="appointment_date"
              label="Select Date"
            >
              <DatePicker
              // disabled
              format="DD-MM-YYYY"
                onChange={handleDateChange}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>

          {isLabReport ? (
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
            <Col>
              <Form.Item
                className="qty-cls "
                label="Enter Time"
                style={{ minWidth: "180px" }}
                name="appointment_time"
              >
                <Select onChange={handleTime} placeholder="Select Time" >
                  {[...uniqueSlots].map((slotString) => {
                    const [startTime, endTime] = slotString.split("-");
                    return (
                      <Option key={slotString} value={startTime}>
                        { moment
                          .utc(startTime, "HH:mm")
                          .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                          .format("hh:mm A")}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          )}
          <Col span={24} sm={24}>
            <Form.Item
              label="Select Doctor"
              name="doctor_id"
              rules={[{ required: true, message: "Please select a doctor!" }]}
            >
              <Select
                filterOption={(input, option) =>
                  (option.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Select Doctors"
                showSearch
                onChange={handleChange}
              >
                {console.log(doctorList, "doc>>>>>.")}
                {doctorList?.map((item) => (
                  <Option key={item?._id} value={item?._id}>
                    <div>
                      {/* <span>Name: </span> */}
                      <span>
                        {item?.name
                          ? item?.name
                          : item?.firstName
                          ? item?.firstName + item?.lastName
                          : "-"}
                      </span>
                      {/* {item?.is_head_doctor && <span> (Head Doctor)</span>} */}
                    </div>
                    {/* <div>
                      <span>Email: </span>
                      <span>{item.email}</span>
                    </div>
                    <div>
                      <span>Specialization: </span>
                      {item?.specialist ? (
                        <span>{item?.specialist}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div> */}
                  </Option>
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

export default AddForm;
