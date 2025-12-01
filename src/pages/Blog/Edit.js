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

    const sectionName   =   "Blog";
    const routeName     =   "blogs";

    const api = {
        addEdit : apiPath.addEditBlog,
        view    : apiPath.viewBlog
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
    
    const [editorValue, setEditorValue] =   useState('');
    const [editorEsValue, setEditorEsValue] =   useState('');
    const [editorDeValue, setEditorDeValue] =   useState('');
    const [editorFrValue, setEditorFrValue] =   useState('');

    const handleEditorChange = (data) =>{
        setEditorValue(data);
    }

    const handleEditorEsChange = (data) =>{
        setEditorEsValue(data);
    }

    const handleEditorFrChange = (data) =>{
        setEditorFrValue(data);
    }

    const handleEditorDeChange = (data) =>{
        setEditorDeValue(data);
    }

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
                setEditorValue(data.data.description);
                setEditorEsValue(data.data.es_description);
                setEditorDeValue(data.data.de_description);
                setEditorFrValue(data.data.fr_description);
                setFile([data.data.thumbnail])
            },
            onError: (error) => {
                ShowToast(error, Severty.ERROR)
            }
        })
    }

    const OnUpdate = (values) => {

        const { title, es_title, de_title, fr_title }         =   values
        const payload           =   {};
        payload.title           =   title;
        // payload.es_title        =   es_title 
        // payload.de_title        =   de_title 
        // payload.fr_title        =   fr_title 
        payload.description     =   editorValue;
        // payload.de_description  =   editorDeValue ;
        // payload.es_description  =   editorEsValue ;
        // payload.fr_description  =   editorFrValue ;
        payload.thumbnail       =   image.length > 0 ? image[0].url : '';
        setAdding(true)
        request({
            url: apiPath.addEditBlog + "/" + params.id,
            method: 'POST',
            data: payload,
            onSuccess: (data) => {
                setAdding(false)
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS)
                    navigate(`/blogs?key=1`);
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
                                <Form.Item label="Upload Thumbnail" name="thumbnail"  >
                                    <div className="mb-1"></div>
                                    <SingleImageUpload fileType={FileType} imageType={'blog'} btnName={'Thumbnail'} onChange={(data)=> handleImage(data)} />
                                    <div className="mt-2"> <Image width={120} src={file && file.length > 0 && file !== ""  ? file : notfound}></Image> </div>
                                </Form.Item>
                            </Col>

                            {/* Start English Blog */}
                            {/* <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.en}</Divider> */}

                            <Col span={24} sm={12}>
                                <Form.Item label={`Title`} name="title" 
                                    rules={[
                                        { required: true, message: `Please enter the title!` },
                                        { max: 100, message: "Title should not contain more then 100 characters!" },
                                        { min: 2, message: "Title should contain atleast 2 characters!" },
                                    ]}
                                    normalize={value => value.trimStart()}
                                >
                                    <Input autoComplete="off" placeholder={`Enter Title in ${longLang.en}`}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={`Description`} name="description">
                                    <DescriptionEditor value={editorValue} placeholder={`Enter Description`} onChange={(data)=> handleEditorChange(data)} />
                                </Form.Item>
                            </Col>
                            

                        </Row>

                        <Form.Item className="btn-row float-right mb-0">
                            <Link type="primary" className="ant-btn ant-btn-primary" to={`/blogs?key=1`}>Back</Link>
                            <Button type="primary" loading={adding} htmlType="submit">Submit</Button>
                        </Form.Item>
                    </Form>
                }
            </Card>
        </>
    )
}

export default Edit;