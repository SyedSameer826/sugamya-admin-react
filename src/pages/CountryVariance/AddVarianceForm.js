import { Col, Form, InputNumber, Modal, Row, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import apiPath from "../../constants/apiPath";
import useRequest from "../../hooks/useRequest";
import { useNavigate } from "react-router";
import { Severty, ShowToast } from "../../helper/toast";

const userType = "Patient";

const AddVarianceForm = ({ section, show, hide, data, refresh }) => {
  const api = {
    fc: apiPath.common.foodCategories,
    selectedFC: apiPath.common.selectedFoodCategories,
    items: apiPath.common.items,
    discount: apiPath.discount,
    patient: apiPath.common.users + "/" + userType,
  };

  const [form] = Form.useForm();
  const { request } = useRequest();
  const {navigate} = useNavigate()
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState();
  const getCountries = () => {
    request({
      url: apiPath.getCountries,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setCountries(data);
      },
    });
  };

  const getProduct = () => {
    request({
      url: apiPath.getProducts,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setProducts(data);
      },
    });
  };

  const addNewVariance = (values) => {
    console.log(values)
    const payload = values;

    request({
      url: data? apiPath.addVariance + "/" + data._id: apiPath.addVariance,
      method: data?"PUT": "POST",
      data: payload,
      onSuccess: ({ status,message, _doc }) => {
        if (!status) {
          ShowToast(message, Severty.ERROR);
          hide()
          refresh()
          return
        };
        console.log("data :: ", _doc);
        hide()
        refresh()
        // navigate("/country-variance")
      },
      onError: (err) => {
        ShowToast(err, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    getCountries();
    getProduct();

  }, []);

  useEffect(() => {
    if (!data) return;
    console.log("Data:", data); // Check if data contains the country field
    form.setFieldsValue({
        ...data,
    });
}, [data, form]);

  const [searchValue, setSearchValue] = useState('');

 

  const filteredCountries = countries.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Modal
      open={show}
      width={840}
      okText={data ? "Save" : "Add"}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        loading: loading,
        htmlType: "submit",
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <h4 className="modal_title_cls">
        {!!data ? "Edit" : "Add New"} {section}
      </h4>

      <Form id="create" form={form} onFinish={addNewVariance} layout="vertical">
        <Row gutter={12}>
          <Col span={12} md={12}>
            <Form.Item
              name="name"
              label="Select the Country"
              rules={[
                {
                  required: true,
                  message: "Missing Country Selection",
                },
              ]}
            >
              
              <Select
              showSearch
                placeholder="Select Country"
                onChange={(e) => console.log(e)}
                filterOption={(input, option) =>
                  option?.label.toLowerCase().includes(input.toLowerCase())
                }
                options = {filteredCountries?.map((item, index) => ({ label: item.name, value: item.name }))}
              >
                 
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} md={12}>
            <Form.Item
              name="variance"
              label="Country Variance (%)"
              rules={[
                {
                  required: true,
                  message: "Please Enter Country Variance",
                },
              ]}
            >
              <InputNumber
               type="number"
              autoComplete="off"
                maxLength={2}
                max={100}
                placeholder="eg. 10 %"
                // disabled={discountAmountType === "flat"}
              />
            </Form.Item>
          </Col>

          <Col span={12} md={12}>
            <Form.Item
              name="fixed_cost"
              label={"Fix Logistics Cost (USD)"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Logistics Cost",
                },
              ]}
            >
              <InputNumber
              type="number"
              autoComplete="off"
                maxLength={7}
                placeholder="Please Enter Logistics Cost"
                // disabled={discountAmountType === "percentage"}
              />
            </Form.Item>
           
          </Col>
        
        </Row>
      </Form>
    </Modal>
  );
};

export default AddVarianceForm;
