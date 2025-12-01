import { Row, Col, Card, Button, Input, Form, Skeleton } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from "../../components/DescriptionEditor";

function AddForm() {
    const sectionName = "Email Template";
    const routeName = "email-template";

    const api = {
        addEdit: apiPath.addEditEmailTemplate,
        view: apiPath.viewEmailTemplate,
    };

    const [form] = Form.useForm();
    const { request } = useRequest();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [editorValue, setEditorValue] = useState("");

    const handleEditorChange = (data) => {
        setEditorValue(data);
    };

    const OnAdd = (values) => {
        if (editorValue.trim() == "<p></p>" || editorValue.trim() === "")
            return ShowToast("Please Enter Description", Severty.ERROR);
        const { title, subject } = values;
        const payload = {};
        payload.title = title;
        payload.description = editorValue;
        payload.subject = subject;
        setLoading(true);
        request({
            url: api.addEdit + "/",
            method: "POST",
            data: payload,
            onSuccess: (data) => {
                setLoading(false);
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS);
                    navigate(`/${routeName}`);
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
                {loading ? (
                    [1, 2].map((item) => <Skeleton active key={item} />)
                ) : (
                    <Form
                        className="edit-page-wrap"
                        form={form}
                        onFinish={OnAdd}
                        autoComplete="off"
                        layout="verticle"
                        name="email_template_form"
                    >
                        <Row gutter={[24, 0]}>
                            <Col span={24} md={12}>
                                <Form.Item
                                    normalize={(value) => value.trimStart()}
                                    label="Title"
                                    name="title"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please Enter the title!",
                                        },
                                    ]}
                                >
                                    <Input
                                        autoComplete="off"
                                        placeholder="Enter Title"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                                <Form.Item
                                    normalize={(value) => value.trimStart()}
                                    label="Subject"
                                    name="subject"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please Enter the subject!",
                                        },
                                    ]}
                                >
                                    <Input
                                        autoComplete="off"
                                        placeholder="Enter Subject"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24} md={24}>
                                <Form.Item
                                    label="Description"
                                    name="description"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please Enter the description!",
                                        },
                                    ]}
                                >
                                    <DescriptionEditor
                                        value={editorValue}
                                        placeholder="Enter Email Template Description"
                                        onChange={(data) =>
                                            handleEditorChange(data)
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item className="btn-row float-right">
                            <Link
                                className="ant-btn ant-btn-primary"
                                to={`/${routeName}`}
                            >
                                Back
                            </Link>
                            <Button
                                className="primary_btn btnStyle"
                                loading={loading}
                                htmlType="submit"
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </>
    );
}
export default AddForm;
