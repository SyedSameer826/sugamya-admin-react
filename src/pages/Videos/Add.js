import { Row, Col, Card, Button, Input, Form, Divider, Image } from "antd";
import React, { useState } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from "../../components/DescriptionEditor";
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";
import { shortLang, longLang } from "../../config/language";
import { Link } from "react-router-dom";

function Add() {
  const sectionName = "Interactive Videos";
  const routeName = "blogs";

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
    "video/mp4",
    "image/gif",
  ];
  const [image, setImage] = useState([]);

  const handleImage = (data) => {
    setImage(data);
  };

  const onCreate = (values) => {
  
    const { description ,image } = values;
    const payload = {image : image};
    console.log(image, "image>>>>>>>")
    payload.description = description;
    //  image && image.length > 0 ? payload.image =image[0].url : ShowToast("Video is not uploaded", Severty.ERROR);
    setLoading(true);
    request({
      url: apiPath.addVideos,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          navigate(`/blogs?key=3`);
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
            {/* <Col span={24} sm={12}>
              <Form.Item label="Upload Video" rules={[
                {
                  validator: (_, value) => {
                    if (image) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Banner image is required"),
                    );
                  },
                },
              ]} name="image">
                <div className="mb-1"></div>
                <SingleImageUpload
                  fileType={FileType}
                  imageType={"video"}
                  btnName={"Video"}
                  onChange={(data) => handleImage(data)}
                />
              </Form.Item>
            </Col> */}

            <Col span={24} sm={12}>
              <Form.Item
                label={`Youtube Url`}
                name="image"
                rules={[
                  {
                    required: true,
                    message: `Please enter Url!`,
                  },
                  // {
                  //   max: 100,
                  //   message:
                  //     "Detail should not contain more then 1000 characters!",
                  // },
                  {
                    min: 2,
                    message: "Detail should contain atleast 50 characters!",
                  },
                ]}
                normalize={(value) => value.trimStart()}
              >
                <Input
                  autoComplete="off"
                  placeholder={`Enter Url`}
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
                    max: 1000,
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
              to={`/blogs?key=3`}
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


