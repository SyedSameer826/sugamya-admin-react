import {
  Button,
  Tooltip,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Space,
  Input,
  TimePicker,
} from "antd";
import React, { useContext, useEffect, useState } from "react";

import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import moment from "moment";
import Loader from "../../components/Loader";

function Index() {
  const { setPageHeading } = useContext(AppStateContext);

  const api = {
    status: apiPath.statusEmailTemplate,
    list: apiPath.listEmailTemplate,
    setting: apiPath.setting,
  };

  const { request } = useRequest();
  const [list, setList] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [form] = Form.useForm();

  const onCreatePolicy = (value) => {
    console.log(value, 2111);

    request({
      url: api.setting,
      method: "POST",
      data: value,
      onSuccess: ({ data, message }) => {
        setList(data);
        ShowToast(message, Severty.SUCCESS);
        setRefresh(prev => !prev)
        fetchData();
      },
      onError: ({ error }) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = () => {
    request({
      url: api.setting,
      method: "GET",
      onSuccess: ({ _doc, message }) => {
        setLoading(false);
        setList(_doc);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  useEffect(() => {
    
    setPageHeading("Setting");
    setLoading(true);
    fetchData();
  }, [refresh]);

  useEffect(() => {
    console.log(list, "list>>>>>>>>>>");
    form.setFieldsValue({
      ...list,
      openingTime: list ? moment(list.openingTime) : "",
      closingTime: list ? moment(list.closingTime) : "",
      deliveryCharges : list?.deliveryCharges ? list?.deliveryCharges : null
    });
  }, [list]);

  return (
    <>
      {/* <div className="tabled"> */}
      <Card>
        {loading ? <Loader />  :  (
          <Form
            id="create"
            form={form}
            onFinish={onCreatePolicy}
            layout="vertical"
            initialValues={
              {
                //   dob: moment("1990-01-01", "DD-MM-YYYY"),
              }
            }
          >
            <Row gutter={[32, 0]}>
            <Col span={24} md={12}>
                <Form.Item
                  label={`Order shippment days (days) (T1)`}
                  name="shippmentDays"
                  rules={[
                    { required: true, message: "Please enter Days" },
                    {
                      max: 2,
                      message:
                        "Days should not contain more then 2 characters!",
                    },
                    {
                      min: 1,
                      message: "Days should contain at least 1 character!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Cart Expiry(days) (T2)`}
                  name="cartExpiry"
                  rules={[
                    { required: true, message: "Please enter days" },
                    {
                      max: 3,
                      message:
                        "Days should not contain more then 3 characters!",
                    },
                    {
                      min: 2,
                      message: "Days should contain at least 2 characters!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>

              <Col span={24} md={12}>
                <Form.Item
                  label={`Patient Inactive days (T4)`}
                  name="patientInactiveDays"
                  rules={[
                    { required: true, message: "Please enter days" },
                    {
                      max: 2,
                      message:
                        "Hours should not contain more then 2 characters!",
                    },
                    {
                      min: 1,
                      message: "Hours should contain at least 1 character!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>

              <Col span={24} md={12}>
                <Form.Item
                  label={`Cancel Before(hours) (T5)`}
                  name="cancelBefore"
                  rules={[
                    { required: true, message: "Please enter hours" },
                    {
                      max: 3,
                      message:
                        "Hours should not contain more then 3 characters!",
                    },
                    {
                      min: 2,
                      message: "Hours should contain at least 2 characters!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
             <Col span={24} md={12}>
              <Form.Item
                label={`Lab Report Awaiting(days) (T8)`}
                name="lab_appointment_hours"
                rules={[
                  { required: true, message: "Please enter Days" },
                  {
                    max: 2,
                    message: "Days should not contain more then 2 characters!",
                  },
                  {
                    min: 1,
                    message: "Days should contain at least 1 character!",
                  },
                ]}
                normalize={(value) => value.trimStart()}
              >
                <Input autoComplete="off" placeholder={`Enter...`} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={`Complete and Cart(Days) (T9)`}
                name="complete_and_cart"
                rules={[
                  { required: true, message: "Please enter days" },
                  {
                    max: 2,
                    message: "Days should not contain more then 2 characters!",
                  },
                  {
                    min: 1,
                    message: "Days should contain at least 1 character!",
                  },
                ]}
                normalize={(value) => value.trimStart()}
              >
                <Input autoComplete="off" placeholder={`Enter...`} />
              </Form.Item>
            </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Slot Duration (minutes)`}
                  name="slotDuration"
                  rules={[
                    { required: true, message: "Please enter hours" },
                    {
                      max: 2,
                      message:
                        "Hours should not contain more then 2 characters!",
                    },
                    {
                      min: 1,
                      message: "Hours should contain at least 1 character!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
               <Col span={24} md={12}>
              <Form.Item
                label={`Replacement Appointment Duration (days)(T7)`}
                name="replacementAppointmentDuration"
                rules={[
                  { required: true, message: "Please enter Days" },
                  {
                    max: 2,
                    message: "Days should not contain more then 2 characters!",
                  },
                  {
                    min: 1,
                    message: "Days should contain at least 1 character!",
                  },
                ]}
                normalize={(value) => value.trimStart()}
              >
                <Input autoComplete="off" placeholder={`Enter...`} />
              </Form.Item>
            </Col>
            
              <Col span={24} md={12}>
                <Form.Item
                  label={`Opening Time`}
                  name="openingTime"
                  rules={[{ required: true, message: "Please enter hours" }]}
                  // normalize={(value) => value.trimStart()}
                >
                  <TimePicker format="hh:mm A" minuteStep={30} use12Hours />

                  {/* <Input autoComplete="off" placeholder={`Enter...`} /> */}
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Closing Time`}
                  name="closingTime"
                  rules={[{ required: true, message: "Please enter hours" }]}
                  // normalize={(value) => value.trimStart()}
                >
                  <TimePicker format="hh:mm A" minuteStep={30} use12Hours />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Rest Duration (minutes)`}
                  name="restDuration"
                  rules={[
                    { required: true, message: "Please enter minutes" },
                    {
                      max: 2,
                      message:
                        "Minutes should not contain more then 2 characters!",
                    },
                    {
                      min: 1,
                      message: "Minutes should contain at least 1 character!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Reschedule Before (hours)`}
                  name="rescheduleBefore"
                  rules={[
                    { required: true, message: "Please enter hours" },
                    {
                      max: 3,
                      message:
                        "Hours should not contain more then 3 characters!",
                    },
                    {
                      min: 2,
                      message: "Hours should contain at least 2 characters!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
            
            
              <Col span={24} md={12}>
                <Form.Item
                  label={`Chat Expiry(days)`}
                  name="chatExpiry"
                  rules={[
                    { required: true, message: "Please enter days" },
                    {
                      max: 2,
                      message:
                        "days should not contain more then 2 characters!",
                    },
                    {
                      min: 1,
                      message: "days should contain at least 1 character!",
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Delivery Charges`}
                  name="deliveryCharges"
                  rules={[
                    { required: true, message: "Please enter charges" },
                  
                    // {
                    //   min: 2,
                    //   message: "Charges should contain at least 2 characters!",
                    // },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} minLength={2} maxLength={2} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Follow Up Chat`}
                  name="follow_up_chat"
                  rules={[
                    { required: true, message: "Please enter Chat" },
                  
                    // {
                    //   min: 2,
                    //   message: "Charges should contain at least 2 characters!",
                    // },
                  ]}
                  normalize={(value) => value.trimStart()}
                >
                  <Input autoComplete="off" placeholder={`Enter...`} minLength={2} maxLength={2} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Disabled Call Button`}
                  name="disabled_call_button"
                  rules={[
                    { required: true, message: "Please enter Disabled Call Button" },
                  
                    // {
                    //   min: 2,
                    //   message: "Charges should contain at least 2 characters!",
                    // },
                  ]}
                  // normalize={(value) => value.trimStart()}
                >
                  <InputNumber autoComplete="off" placeholder={`Enter...`} minLength={2} maxLength={2} />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label={`Gst (%)`}
                  name="gst"
                  rules={[
                    { required: true, message: "Please enter Gst" },
                  
                    // {
                    //   min: 2,
                    //   message: "Charges should contain at least 2 characters!",
                    // },
                  ]}
                  // normalize={(value) => value.trimStart()}
                >
                  <InputNumber autoComplete="off" placeholder={`Enter Gst`} minLength={1} maxLength={2} />
                </Form.Item>
              </Col>
            </Row>
            <Button
              type="primary"
              className="primary_btn btnStyle"
              htmlType="submit"
            >
              Save
            </Button>
          </Form>
        )}
      </Card>
      {/* </div> */}
    </>
  );
}

export default Index;
