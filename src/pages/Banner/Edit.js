import {Row, Col, Card, Button, Input, Form, Skeleton, Divider, Image} from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from '../../components/DescriptionEditor'
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";
import { shortLang, longLang } from "../../config/language";

function Edit() {

    const sectionName   =   "Banner";
    const routeName     =   "banners";

    const api = {
        addEdit : apiPath.editBanner,
        view    : apiPath.viewBanner
    }

    const [form]                        =   Form.useForm();
    const { request }                   =   useRequest()
    const params                        =   useParams();
    const [loading, setLoading]         =   useState(false)
    const [adding, setAdding]         =   useState(false)
    const navigate                      =   useNavigate();
    const FileType                      =   ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"]
    const [image, setImage]             =   useState([]);
    const [file, setFile]               =   useState([]);

    const handleImage = (data) =>{
        setImage(data);
    }

    const fetchData = (id) => {
        request({
            url: api.view + "/" + id,
            method: 'GET',
                onSuccess: (data) => {
                setLoading(false);
                form.setFieldsValue(data.data)
            //    setImage(data.data.image);
               setFile(data.data.image)

            },
            onError: (error) => {
                ShowToast(error, Severty.ERROR)
            }
        })
    }

    const OnUpdate = (values) => {

        const { description}         =   values
        const payload =   {};
       
        payload.description     =   description;
        payload.image       =   image.length > 0 ? image[0].url : '';
        setAdding(true)
        request({
            url: apiPath.editBanner + "/" + params.id,
            method: 'PUT',
            data: payload,
            onSuccess: (data) => {
                setAdding(false)
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS)
                    navigate(`/blogs?key=2`);
                } else {
                    ShowToast(data.message, Severty.ERROR)
                }
            },
            onError: (error) => {
                ShowToast(error.response.data.message, Severty.ERROR)
                setAdding(false)
            },
        })
    };
    

    useEffect(() => {
      setLoading(true)
      fetchData(params.id)
    }, [])

    return (
        <>
            <Card title={"Edit " + sectionName}>
                {loading ? [1,2,3,4,5].map(item => <Skeleton active key={item} />) :
                    <Form className="edit-page-wrap colPadding" form={form} onFinish={OnUpdate} autoComplete="off" layout="verticle" name="blog_form">

                        <Row gutter={[24, 0]}>

                            <Col span={24} sm={12}>
                                <Form.Item label="Upload Image" name="image"  >
                                    <div className="mb-1"></div>
                                    <SingleImageUpload fileType={FileType} imageType={'blog'} btnName={'Image'} onChange={(data)=> handleImage(data)} />
                                    <div className="mt-2"> <Image width={120} src={file && file.length > 0 && file !== ""  ? file : notfound}></Image> </div>
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
                            <Link type="primary" className="ant-btn ant-btn-primary" to={`/blogs?key=2`}>Back</Link>
                            <Button type="primary" loading={adding} htmlType="submit">Submit</Button>
                        </Form.Item>
                    </Form>
                }
            </Card>
        </>
    )
}

export default Edit;