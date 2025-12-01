import { Col, Form, Input, Modal, Row, Select } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";
import SingleImageUpload from "../../components/SingleImageUpload";

const AddForm = ({ section, api, show, hide, selected, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    form.setFieldsValue({
      ...selected,
      name: selected?.name,
      price: selected?.price,
      description: selected?.description,
    });

    setImage(selected?.image);
  }, [selected]);

  const onCreate = (values) => {
    const { generic_name, name, price, description, batch, source, unit, quantity } = values;
    const payload = {};
    setLoading(true);
    payload.generic_name = generic_name;

    payload.name = name;
    payload.description = description ?? selected?.description;
    payload.price = price ?? selected?.price;
    payload.image = image;
    payload.unit = unit;
    payload.source = source;
    payload.batch = batch;
    payload.quantity = quantity;
    request({
      url: `${selected ? apiPath.product + "/" + selected?._id : apiPath.product
        }`,
      method: selected ? "PUT" : "POST",
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
  const FileType = ["image/png", "image/jpg", "image/jpeg", "image/jfif", "application/pdf"];

  return (
    <Modal
      open={show}
      width={750}
      okText={selected ? "Update" : "Add"}
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
          dob: moment("1990-01-01", "DD-MM-YYYY"),
        }}
      >
        <div className="add_user_title">
          <h4 className="modal_title_cls">{`${selected
              ? "Edit Product" /* sectionName */
              : "Add Product" /* sectionName */
            }`}</h4>
        </div>
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <div className="text-center">
              <Form.Item
                className="upload_wrap"
                rules={[
                  {
                    validator: (_, value) => {
                      if (image) {
                        return Promise.resolve();
                      }
                      // return Promise.reject(
                      //   new Error("Product image is required")
                      // );
                    },
                  },
                ]}
                name="image"
              >
                <SingleImageUpload
              fileType={FileType}
              imageType={"image"}
              btnName={"Picture"}
              onChange={(data) => setImage(data[0]?.url)}
            >

            </SingleImageUpload>
              </Form.Item>
            </div>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Product generic Name`}
              name="generic_name"
              rules={[
                { required: true, message: "Please enter the product name" },
                {
                  max: 100,
                  message: "Name should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Name`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Product Name`}
              name="name"
              rules={[
                { required: true, message: "Please enter the product name" },
                {
                  max: 100,
                  message: "Name should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Name`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Product Unit`}
              name="unit"
              rules={[
                { required: true, message: "Please enter the product unit" },
                {
                  max: 100,
                  message: "Name should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Select
                placeholder="Select Product Unit"
                onChange={(e) => console.log(e)}
              >
                <option value={"nos"}>NOS</option>
                <option value={"packet"}>Packet</option>
                <option value={"bottle"}>Bottle</option>

              </Select>
              {/* <Input autoComplete="off" placeholder={`Enter `} /> */}
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={`Quantity(per unit)`}
              name="quantity"
              rules={[
                { required: true, message: "Missing the quantity!" },

              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input
                type="text"
                autoComplete="off"
                placeholder={`Enter Quantity`}
              />
            </Form.Item>
          </Col>



          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Batch No"
              name="batch"
              rules={[
                { required: true, message: "Missing the batch number!" },
                // { max: 10, message: "Batch No contain maximum 10 digits " },
        
              ]}
            >
              <Input
                type="text" // Change type to "text" to allow alphanumeric input
                autoComplete="off"
                placeholder="Enter Batch Number"
              />
            </Form.Item>
          </Col>


          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Base price"
              name="price"
              rules={[
                { required: true, message: "Missing the price!" },
                // { max: 7, message: "Price contain maximum 7 digits " },
              ]}
            >
              <Input
                type="text"
                maxLength={10}
                autoComplete="off"
                placeholder="Enter Base price"
              />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Source"
              name="source"
              rules={[
                { required: true, message: "Missing the source!" },
                { max: 15, message: "Source contain maximum 15 digits " },
              ]}
            >
              <Input autoComplete="off" placeholder="Enter Source" />
            </Form.Item>
          </Col>

          <Col span={24} lg={12} sm={12}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter the email!" },
                {
                  max: 100,
                  message: "description should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message: "description should contain at least 2 characters!",
                },
              ]}
            >
              <Input.TextArea
                className="text-areain"
                autoSize={true}
                autoComplete="off"
                placeholder="Enter Product Description"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
