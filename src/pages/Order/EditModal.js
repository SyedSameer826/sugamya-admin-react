import { Button, Checkbox, Col, Form, Modal, Rate, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import apiPath from "../../constants/apiPath";
import AgentImg from "../../assets/images/face-1.jpg";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import moment from "moment";
import Currency from "../../components/Currency";
import { formatPhone } from "../../helper/functions";

const EditForm = ({ api, show, hide, data, refresh }) => {
    const [form] = Form.useForm();
    const { request } = useRequest();
    const [file, setFile] = useState([]);
    const [image, setImage] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addItem, setAddItem] = useState(false);
    const [changeDriver, setChangeDriver] = useState(false);
    const FileType = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/avif",
        "image/webp",
        "image/gif",
    ];
    const [value, setValue] = useState(1);

    const onChange = (e) => {
        console.log('radio checked', e.target.value);
        setValue(e.target.value);
    };


    useEffect(() => {
        if (!data) return;
        console.log(data);
        form.setFieldsValue({ ...data });
        setFile([data.image]);
    }, [data]);

    const onCreate = (values) => {
        const { name, ar_name, status } = values;
        console.log(values, "values");
        const payload = {};
        setLoading(true);
        payload.name = name;
        payload.ar_name = ar_name;
        payload.is_active = status;
        payload.image = image && image.length > 0 ? image[0].url : "";

        console.log(payload, "hfdjhjkhgjkfhgjkfhg");
        request({
            url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
            method: data ? "PUT" : "POST",
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

    return (
        <Modal
            open={show}
            width={950}
            okText="Add"
            onCancel={hide}
            cancelText={null}
            footer={[
                <Button key="okay" type="primary" onClick={hide}>
                    Update
                </Button>,
            ]}
            okButtonProps={{
                form: "create",
                htmlType: "submit",
                loading: loading,
            }}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="tab_modal"
        >
            {/* <Form id="create" form={form} onFinish={onCreate} layout="vertical"> */}
            <h4 className="modal_title_cls">Edit Order</h4>
            <Row>
                <Col span={24} md={12}>
                    <div className="order-head text-left">
                        <h4>{data.restaurant_id.name}</h4>
                        <span><Rate disabled defaultValue={0} /><span className="no-rating">0</span>(0 Reviews)</span>
                        <p className="orderid">Order ID : {data.uid}</p>
                        <p>{moment(data.created_at).format('LLL')}</p>
                    </div>
                </Col>
                <Col span={24} md={12}>
                    <div className="order-dtl-card edit-order-dtl">
                        <div className="order-header">
                            <h3>Customer Details</h3>
                        </div>
                        <div className="customer-dtl">
                            <div className="customer-info">
                                <h6>Name :</h6>
                                <h5>{data.customer_id.name}</h5>
                            </div>
                            <div className="customer-info">
                                <h6>Phone Number :</h6>
                                <h5>{formatPhone(data.customer_id.country_code, data.customer_id.mobile_number)}</h5>
                            </div>
                            <div className="customer-info">
                                <h6>Address :</h6>
                                <h5>Box No. 2399, Abu Dhabi, Emirates</h5>
                            </div>
                        </div>
                    </div>
                </Col>
                {!addItem && <Col span={24} md={24}>
                    <div className="addNewItem">
                        <Button onClick={() => setAddItem(true)} className="btn_primary">Add New Item</Button>
                    </div>
                </Col>}
            </Row>
            <Row gutter={[45, 0]}>
                <Col span={24} sm={24}>
                    {addItem && <AddFood refresh={() => setAddItem(false)} order={data} />}
                    <div className="order-dtl-card">
                        <div className="order-header">
                            <h3>Order Details</h3>
                        </div>
                        <div className="order-dtl-list edit-order">
                            {data.items.map((item, idx) => <OrderItem item={item} key={idx} />)}
                        </div>
                    </div>
                    {
                        data.driver_id ?
                            <div className="order-dtl-card">
                                <div className="order-header">
                                    <h3>Delivery Agent Details</h3>
                                </div>
                                <div className="customer-dtl">
                                    <div className="delivery-agent-dtl">
                                        <div className="agent-img">
                                            <img src={AgentImg} />
                                        </div>
                                        <div className="agent-info">
                                            <div className="customer-info">
                                                <h6>Name :</h6>
                                                <h5>{data.driver_id.name}</h5>
                                            </div>
                                            <div className="customer-info">
                                                <h6>Phone Number :</h6>
                                                <h5>{formatPhone(data.driver_id.country_code, data.driver_id.mobile_number)}</h5>
                                            </div>
                                            <div className="customer-info">
                                                <h6>Vehicle No. :</h6>
                                                <h5>UAE 123456</h5>
                                            </div>
                                        </div>
                                        <div className="changeDriver">
                                            <Button onClick={() => setChangeDriver(true)} className="btn_primary">Change Driver</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="changeDriver">
                                <Button onClick={() => setChangeDriver(true)} className="btn_primary">Assign Driver</Button>
                            </div>
                    }
                    {changeDriver && <ChangeDriver order={data} refresh={() => setAddItem(false)} />}
                </Col>

            </Row>
            {/* </Form> */}
        </Modal>
    );
};

const AddFood = ({ data, api, refresh, order }) => {

    const [form] = Form.useForm();

    const { request } = useRequest();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCategory = (id) => {
        request({
            url: `${apiPath.adminCommon}/restaurant-category/${order.restaurant_id.vendor_id}`,
            method: "GET",
            onSuccess: ({ data, status }) => {
                console.log(data, 'city');
                if (status) {
                    setCategories(data)
                }
            },
        });
    };

    const getFood = (id) => {
        request({
            url: `${apiPath.adminCommon}/restaurant-food/${id}`,
            method: "GET",
            onSuccess: ({ data, status }) => {
                console.log(data, 'city');
                if (status) {
                    setItems(data)
                }
            },
        });
    };

    useEffect(() => {
        getCategory()
    }, [])

    const onCreate = (values) => {
        const { name, ar_name, status } = values;
        console.log(values, "values");
        refresh();
        const payload = {};
        // setLoading(true);
        return
        request({
            url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
            method: data ? "PUT" : "POST",
            data: payload,
            onSuccess: (data) => {
                setLoading(false);
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS);

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


    return (
        <div className="order-dtl-card">
            <div className="order-header">
                <h3>Add New Item</h3>
            </div>
            <Form id="create" form={form} onFinish={onCreate} layout="vertical">
                <div className="order-dtl-list add-item">
                    <Row gutter={20}>
                        <Col span={24} md={12}>
                            <Form.Item
                                label="Choose Category"
                                name="category_id"
                                rules={[
                                    { required: true, message: "Please select Category!" },
                                ]}
                            >
                                <Select
                                    width="500"
                                    placeholder="Select Category"
                                    onChange={(value) => getFood(value)}
                                >
                                    {categories.map(item => <Select.Option key={item._id} value={item._id} > {item.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                            <Form.Item
                                label="Choose Item"
                                name="food_id"
                                rules={[
                                    { required: true, message: "Please select Item!" },
                                ]}
                            >
                                <Select
                                    width="500"
                                    placeholder="Select Item"
                                >
                                    {items.map(item => <Select.Option key={item._id} value={item._id} > {item.name}</Select.Option>)}
                                </Select>

                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Form.Item >
                            <Button htmlType="submit" className="btn_primary">UPDATE ITEM</Button>
                        </Form.Item>
                    </Row>
                </div>
            </Form>
        </div>
    )
}

const ChangeDriver = ({ order, refresh }) => {

    const [form] = Form.useForm();

    const { request } = useRequest();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCategory = (id) => {
        request({
            url: `${apiPath.adminCommon}/restaurant-category/${order.restaurant_id.vendor_id}`,
            method: "GET",
            onSuccess: ({ data, status }) => {
                console.log(data, 'city');
                if (status) {
                    setCategories(data)
                }
            },
        });
    };

    const getFood = (id) => {
        request({
            url: `${apiPath.adminCommon}/restaurant-food/${id}`,
            method: "GET",
            onSuccess: ({ data, status }) => {
                console.log(data, 'city');
                if (status) {
                    setItems(data)
                }
            },
        });
    };

    useEffect(() => {
       // getCategory()
    }, [])

    const onCreate = (values) => {
        const { name, ar_name, status } = values;
        console.log(values, "values");
        refresh();
        const payload = {};
        // setLoading(true);
        return
        request({
            url: `${order ? apiPath.addEdit + "/" + order._id : apiPath.addEdit}`,
            method: order ? "PUT" : "POST",
            data: payload,
            onSuccess: (data) => {
                setLoading(false);
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS);

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


    return (
        <div className="order-dtl-card">
            <div className="order-header">
                <h3>Assign New Driver</h3>
            </div>
            <Form id="create" form={form} onFinish={onCreate} layout="vertical">
                <div className="order-dtl-list add-item">
                    <Row gutter={20}>
                        <Col span={24} md={12}>
                            <Select
                                width="500"
                                Label="Select Location"
                                placeholder="Select Location"

                            />
                        </Col>
                        <Col span={24} md={12}>
                            <Select
                                width="500"
                                Label="Select Driver"
                                placeholder="Select Driver"
                            />
                        </Col>
                    </Row>
                </div>
            </Form>
        </div>
    )
}

const OrderItem = ({ item }) => {

    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    return (
        <React.Fragment >
            <div className="single-order-dtl">
                <div className="order-dtl-left">
                    <h6>{item.qty}x</h6>
                </div>
                <div className="order-middle">
                    <h4>{item.qty} x{item.food.name}</h4>
                    <p>Mixed vegetables</p>
                    <div className="editorder-cls">
                        <Button onClick={() => setEdit(true)} className="btn_primary">
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.1845 4.10522L12.5965 5.51655M12.0925 2.86188L8.27449 6.67989C8.07722 6.87688 7.94267 7.12787 7.88782 7.40122L7.53516 9.16655L9.30049 8.81322C9.57382 8.75855 9.82449 8.62455 10.0218 8.42722L13.8398 4.60922C13.9546 4.49449 14.0456 4.35828 14.1077 4.20838C14.1697 4.05847 14.2017 3.89781 14.2017 3.73555C14.2017 3.5733 14.1697 3.41263 14.1077 3.26273C14.0456 3.11282 13.9546 2.97662 13.8398 2.86188C13.7251 2.74715 13.5889 2.65614 13.439 2.59405C13.2891 2.53196 13.1284 2.5 12.9662 2.5C12.8039 2.5 12.6432 2.53196 12.4933 2.59405C12.3434 2.65614 12.2072 2.74715 12.0925 2.86188Z" stroke="#414454" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12.8672 10.4987V12.4987C12.8672 12.8523 12.7267 13.1915 12.4767 13.4415C12.2266 13.6916 11.8875 13.832 11.5339 13.832H4.20052C3.8469 13.832 3.50776 13.6916 3.25771 13.4415C3.00766 13.1915 2.86719 12.8523 2.86719 12.4987V5.16536C2.86719 4.81174 3.00766 4.4726 3.25771 4.22256C3.50776 3.97251 3.8469 3.83203 4.20052 3.83203H6.20052" stroke="#414454" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Edit order
                        </Button>
                    </div>
                </div>
                <div className="order-right">
                    <h4><Currency price={item.price} /></h4>
                </div>
            </div>
            {
                edit &&
                <div className="addons-wrap">
                    <div className="order-header">
                        <h3>Add On's: <span>(optional)</span></h3>
                    </div>
                    <div className="select_add_ons">
                        <Checkbox value="Cheese">Cheese</Checkbox>
                        <Checkbox value="Lettuce">Lettuce</Checkbox>
                        <Checkbox value="Meat">Meat</Checkbox>
                        <Checkbox value="Sauce">Sauce</Checkbox>
                    </div>
                </div>
            }
        </React.Fragment>
    )
}

export default EditForm;
