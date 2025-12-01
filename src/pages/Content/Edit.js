import { Row, Col, Card, Button, Input, Form, Skeleton, Divider, Space, Image } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from '../../components/DescriptionEditor'
import { shortLang, longLang } from "../../config/language";


function Edit() {

    const sectionName = "Content";
    const routeName = "content";
    const api = {
        content: apiPath.content,
        viewContent: apiPath.viewContent,
    }

    const [form] = Form.useForm();
    const { request } = useRequest()
    const params = useParams();
    const [loading, setLoading] = useState(false)
    const [formValue, setFormValue] = useState();
    const navigate = useNavigate();

    const [editorValue, setEditorValue] = useState('');

    const [file, setFile] = useState([]);
    const FileType = ["application/pdf"];

    const handleImage = (data) => {
        data.length > 0 ? setFile(data[0].url) : setFile([]);
    }

    const handleEditorChange = (data) => {
        setEditorValue(data);
    }

    const fetchData = (slug) => {
        request({
            url: apiPath.viewContent + "/" + slug,
            method: 'GET',
            onSuccess: (data) => {
                console.log(data.data);
                form.setFieldsValue(data.data);
                setFormValue(data.data);
                setLoading(false);

                if (data?.data?.slug !== 'faq') {
                    setEditorValue(data.data?.description);
                }

            },
            onError: (error) => {
                ShowToast(error, Severty.ERROR)
            }
        })
    }

    const OnUpdate = (values) => {

        const { name,faq } = values
        const payload = {};
        console.log(values, "payload");
        if (formValue.type == 'document') {
            payload.document = file ? file : null;
        } else {

            if (formValue.slug != 'faq') {

                // if (editorValue.trim() === '<p></p>' || editorValue.trim() === "") return ShowToast('Please Enter Description in English', Severty.ERROR)

                payload.name = name;
                payload.description = editorValue;

            } else {
                payload.faq = faq;
            }
        }

        setLoading(true)
        request({
            url: api.content + "/" + params.slug,
            method: 'PUT',
            data: payload,
            onSuccess: (data) => {
                setLoading(false)
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS)
                    navigate(`/blogs?key=4`);
                } else {
                    ShowToast(data.message, Severty.ERROR)
                }
            },
            onError: (error) => {
                ShowToast(error?.response?.data?.message, Severty.ERROR)
                setLoading(false)
            },
        })
    };

    useEffect(() => {
        setLoading(true)
        fetchData(params.slug)
    }, [])

    return (

        <Card title={"Update " + sectionName}>
            {loading ? [1, 2, 3, 4].map(item => <Skeleton active key={item} />) :
                <Form className="edit-page-wrap colPadding" form={form} onFinish={OnUpdate} autoComplete="off" layout="verticle" name="content_form">

                    {
                        formValue && formValue.slug && formValue.slug === 'faq' ?
                            <Row gutter={[24, 0]}>

                                {/* Start English Content */}

                                <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.en}</Divider>

                                <Col md={24}>
                                    <Form.List name="faq" className="mt-2">
                                        {(fields, { add, remove }, { form }) => (
                                            <>
                                                {fields.map((field_en, index_en) => (
                                                    <div key={field_en.key}>
                                                        <Space key={field_en.key} align="baseline" className="gap-cls">
                                                            <Row>

                                                                {index_en > 0 ?
                                                                    <Divider orientation="left" orientationMargin={0} className="devider-color">{`Question & Answer ` + (index_en + 1)}
                                                                    </Divider>
                                                                    : null}

                                                                <Col span={24} sm={12}>
                                                                    <Form.Item className="qty-cls"
                                                                        {...field_en}
                                                                        name={[field_en.name, 'question']}
                                                                        label="Question"
                                                                        rules={[{ required: true, message: 'Please enter question' }]}
                                                                        normalize={value => value.trimStart()}
                                                                    >
                                                                        <Input autoComplete="off" placeholder={`Enter Question in ${longLang.en}`} />

                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={24} sm={12}>
                                                                    <Form.Item className="qty-cls"
                                                                        {...field_en}
                                                                        name={[field_en.name, 'answer']}
                                                                        label="Answer"
                                                                        rules={[{ required: true, message: 'Please enter answer' }]}
                                                                        normalize={value => value.trimStart()}
                                                                    >
                                                                        <Input autoComplete="off" placeholder={`Enter Answer in ${longLang.en}`} />

                                                                    </Form.Item>
                                                                </Col>

                                                                {index_en > 0 ?
                                                                    <div className="minus-wrap" style={{ marginTop: "13px" }}>
                                                                        <MinusCircleOutlined onClick={() => remove(field_en.name)} style={{ borderRadius: "8px" }} />
                                                                    </div>
                                                                    : null}

                                                            </Row>
                                                        </Space>
                                                    </div>
                                                ))}

                                                <Col span={4}>
                                                    <Form.Item className="mt-2">
                                                        
                                                        <Button type="primary" onClick={() => add()} block icon={<PlusOutlined />}>Add Faq</Button>
                                                    </Form.Item>
                                                </Col>
                                            </>
                                        )}
                                    </Form.List>
                                </Col>

                                {/* End English Content */}

                            </Row>
                            :
                            <Row gutter={[24, 0]}>

                                <Col span={24} sm={12}>
                                    <Form.Item label={`Name`} name="name"
                                        rules={[
                                            { required: true, message: `Please enter the name in ${longLang.en}!` },
                                            { max: 100, message: "Name should not contain more then 100 characters!" },
                                            { min: 2, message: "Name should contain atleast 2 characters!" },
                                        ]}
                                        normalize={value => value.trimStart()}
                                    >
                                        <Input autoComplete="off" placeholder={`Enter Name in ${longLang.en}`} />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Form.Item label={`Description`} name="description"
                                    // rules={[
                                    //     { required: true, message: `Enter Description in ${longLang.en}!` },
                                    // ]}
                                    >
                                        <DescriptionEditor value={editorValue} placeholder={`Enter Description`} onChange={(data) => handleEditorChange(data)} />
                                    </Form.Item>
                                </Col>

                            </Row>
                    }

                    <Form.Item className="btn-row float-right mb-0">
                        <Link className="ant-btn ant-btn-primary" type="primary" to={`/blogs?key=4`}>Back</Link>
                        <Button type="primary" loading={loading} htmlType="submit">Submit</Button>
                    </Form.Item>
                </Form>
            }
        </Card>
    )
}
export default Edit;
