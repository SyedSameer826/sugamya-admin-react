import { Col, Form, Input, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import { Option } from "antd/lib/mentions";

const AddForm = ({ api, show, hide, selected, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log(selected);

  const onCreate = (values) => {
    const payload = {
      ...values,
    };

    setLoading(true);

    request({
      url: `${selected ? api.ailment + "/" + selected._id : api.ailment}`,
      method: selected ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          refresh();
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

  const getCategories = () => {
    request({
      url: api.category + `?page=1&pageSize=10`,
      method: "GET",
      onSuccess: ({ data }) => {
        setCategories(data.docs);
        console.log("set get catoroiess", data.docs);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  useEffect(() => {
    getCategories();
    if (!selected) return;

    form.setFieldsValue({
      ...selected,
      category_id: selected?.category_id._id,
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
        <h4 className="modal_title_cls">{selected ? "Edit" : "Add"} Ailment</h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={12}>
            <Form.Item
              label="Category Name"
              name="category_id"
              rules={[
                {
                  max: 100,
                  message:
                    "Category Name should not contain more then 100 characters!",
                },
                {
                  min: 2,
                  message:
                    "Category Name should contain at least 2 characters!",
                },
                {
                  required: true,
                  message: "Please enter ailment category name",
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Select
                // onChange={(key, val) => console.log(key, val)}
                placeholder="Enter Ailment Category"
              >
                {categories
                  ? categories?.map((ctg) => {
                      return (
                        <Option key={ctg?.name} value={ctg?._id}>
                          {ctg?.name}
                        </Option>
                      );
                    })
                  : ""}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label="Ailment Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter ailment name",
                },
                {
                  min: 2,
                  message: "Name should contain at least 2 characters!",
                },
                {
                  max: 100,
                  message: "Name should not contain more than 100 characters!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const regex = /^[A-Za-z0-9 ]+$/;
                    if (!regex.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Name can only contain letters, numbers, and spaces!"
                        )
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              normalize={(value) => value?.trimStart()}
            >
              <Input autoComplete="off" placeholder="Enter Ailment Name" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
