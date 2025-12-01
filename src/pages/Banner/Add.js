import { Row, Col, Card, Button, Input, Form, Divider, Image } from "antd";
import React, { useState } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import SingleImageUpload from "../../components/SingleImageUpload";
import { Link } from "react-router-dom";

function Add() {
  const sectionName = "Banner";
  const routeName = "banners";

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];
  const [image, setImage] = useState([]);

  const handleImage = (data) => {
    setImage(data);
  };

  const onCreate = (values) => {
  
    const { description } = values;
    const payload = {};

    payload.description = description;
    payload.image = image && image.length > 0 ? image[0].url : "";
    setLoading(true);
    request({
      url: apiPath.addBanner,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          navigate(`/blogs?key=2`);
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
  const stateData = {
    data:{
      tab:2
    }
  }

  return (
    <>
      <Card title={"Add " + sectionName}>
        <Form
          className="edit-page-wrap colPadding"
          form={form}
          onFinish={onCreate}
          autoComplete="off"
          layout="verticle"
          name="blog_form"
        >
          <Row gutter={[24, 0]}>
            <Col span={24} sm={12}>
              {/* rules={[ { required: true, message: "Please select the thumbnail image!" } ]}  */}
              <Form.Item label="Upload Image" name="image">
                <div className="mb-1"></div>
                <SingleImageUpload
                  fileType={FileType}
                  imageType={"banner"}
                  btnName={"Image"}
                  onChange={(data) => handleImage(data)}
                />
              </Form.Item>
            </Col>

            <Col span={24} sm={12}>
              <Form.Item
                label={`Description`}
                name="description"
                rules={[
                  {
                    required: true,
                    message: `Please enter details!`,
                  },
                  {
                    max: 100,
                    message:
                      "Detail should not contain more then 1000 characters!",
                  },
                  {
                    min: 2,
                    message: "Detail should contain atleast 50 characters!",
                  },
                ]}
                normalize={(value) => value.trimStart()}
              >
                <Input
                  autoComplete="off"
                  placeholder={`Enter details`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="btn-row float-right mb-0">
            <Link
              className="ant-btn ant-btn-primary"
              type="primary"
              to ="/blogs?key=2"
            >
              Back
            </Link>
            <Button type="primary" loading={loading} htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

export default Add;


