import { Col, Form, Input, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const AddCategory = ({ api, show, hide, selected, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  console.log(selected);
  const onCreate = (values) => {
    const payload = {
      ...values,
    };

    setLoading(true);

    request({
      url: `${selected ? api.category + "/" + selected._id : api.category}`,
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

  useEffect(() => {
    if (!selected) return;

    form.setFieldsValue({
      ...selected,
    });
  }, [selected]);

  return (
    <Modal
      width={500}
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
          {selected ? "Edit" : "Add"} Category
        </h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={24} sm={24}>
            <Form.Item
              label="Category Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter category name",
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
                          "Category name can only contain letters, numbers, and spaces!"
                        )
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              normalize={(value) => value?.trimStart()}
            >
              <Input autoComplete="off" placeholder="Enter Category Name" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddCategory;
