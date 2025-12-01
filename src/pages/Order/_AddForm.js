import { Col, Form, Input, Modal, Checkbox, Row, Select, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import moment from "moment";



const AddForm = ({ setEmail, api, show, hide, selected, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [isCollector, setIsCollector] = useState(
    selected ? selected.is_collector : false,
  );


  const onCreate = (values) => {

    const payload = {
      ...values,

    };
    payload.deliveryDate = values?.deliveryDate ? moment(values?.deliveryDate).format("DD-MM-YYYY") : null;
    console.log(payload, "payload");
    setLoading(true);

    request({
      url: `${selected ? api.addEdit + "/" + selected._id : api.addEdit}`,
      method: selected ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          if (selected) {
            refresh();
          } else {
            refresh();
          }
          hide();
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
    if (!selected) return;

    form.setFieldsValue({
      ...selected,
      docketDate: selected.docketDate ? moment(selected?.docketDate) : "",
      deliveryDate: selected.deliveryDate ? moment(selected.deliveryDate) : "",
    });
 
  }, [selected]);



  return (
    <Modal
      width={780}
      open={show}
      okText={selected ? "Update" : "Create"}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">
          {selected ? "Edit" : "Add"} Order
        </h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={12}>
            <Form.Item
              label="Agency"
              name="agency"
              rules={[
                {
                  max: 20,
                  message: "Agency should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Agency should contain at least 2 characters!",
                },
                {
                  required: true,
                  message: "Please enter Agency",
                },
               
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Agency`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label="Docket Number"
              name="docketNumber"
              rules={[
                {
                  max: 20,
                  message: "Docket Number should not contain more then 20 characters!",
                },
                {
                  min: 2,
                  message: "Docket Number should contain at least 2 characters!",
                },
                {
                  required: true,
                  message: "Please enter Docket Number",
                },
               
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Docket Number`} />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} span={12}>
                  <Form.Item
                 label="Docket Date"
                    className="username "
                    name="docketDate"
                    rules={[
                      {
                        required: true,
                        message: ("Please select a Date!"),
                      },
                    ]}
                  >
                    <DatePicker
                      className="date-inn"
                      placeholder={("Enter Docket Date")}
                      format={"DD-MM-YYYY"}
                      disabledDate={(current) => {
                        return current && current < moment().startOf('day');
                      }}
                    />
                  </Form.Item>
                </Col>


          <Col span={24} sm={12}>
            <Form.Item
              label={<span>{(`Delivery Date`)}</span>}
              name="deliveryDate"
              rules={[
                {
                  required: true,
                  message: ("Please select the date"),
                },
              ]}
            >
              <DatePicker
                format={"DD-MM-YYYY"}
                placeholder={("Select Delivery Date")}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
