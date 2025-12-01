// import { Row, Col, Card, Button, Skeleton, Checkbox, Form } from "antd";
// import React, { useState, useEffect } from "react";
// import { useParams,Link } from "react-router-dom";
// import useRequest from "../../../hooks/useRequest";
// import { ShowToast, Severty } from "../../../helper/toast";
// import apiPath from "../../../constants/apiPath";
// import { Badge } from 'antd';
// import moment from 'moment';
// import { menuItems } from "../../../components/layout/Sidenav";

// console.log("menuIteeeeesssss",menuItems)
// function Permission() {

//   const sectionName = "Sub Admin";
//   const routeName = "sub-admin";

//   const params = useParams();
//   const [form] = Form.useForm();
//   const { request } = useRequest();
//   const [list, setList] = useState({});
//   const [moduleList, setModuleList] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [adding, setAdding] = useState(false);
//   const [sections, setSections] = useState([])
//   const [permission, setPermission] = useState({})
//   const [refresh, setRefresh] = useState(false)

//   const fetchData = (id) => {
//     setLoading(true);
//     request({
//       url: apiPath.viewSubAdmin + "/" + id,
//       method: 'GET',
//       onSuccess: (data) => {
//         setLoading(false);
//         setList(data.data);
//         form.setFieldsValue(data.data.permission)
//         setPermission(data.data.permission ? data.data.permission : {})
//       },
//       onError: (error) => {
//         ShowToast(error, Severty.ERROR)
//       }
//     })
//   }

//   const fetchModule = (id) => {
//     setLoading(true);
//     request({
//       url: apiPath.getModule,
//       method: 'POST',
//       onSuccess: (data) => {
//         setLoading(false);
//         setModuleList(data.data.data.sort((a, b) => {
//           if (a.name < b.name) {
//             return -1;
//           }
//           if (a.name > b.name) {
//             return 1;
//           }
//           return 0;
//         }));
//       },
//       onError: (error) => {
//         ShowToast(error, Severty.ERROR)
//       }
//     })
//   }

//   const handleOnChange = (values, key) => {
//     let newArray = [...values]

//     if (values.includes('add') || values.includes('edit') || values.includes('delete')) {
//       newArray = [...values, 'view']
//     }
//     setPermission(prev => ({ ...prev, [key]: [...new Set(newArray)] }))
//     setSelected(values)
//   }


//   useEffect(() => {
//     // fetchData(params.id)
//   }, [refresh])


//   useEffect(() => {
//     // fetchModule()
//     let newArray = []
//     menuItems.forEach(item => {
//       if (item.children) {
//         console.log(item.children)
//         newArray = [...newArray, ...item.children]
//       } else {
//         console.log("pushhhhhhhhhhhhhh",item)
//         newArray.push(item)
//       }
//     })
//     console.log("setDEction nn",setSections)
//     setSections(newArray.filter(item => item.label != "Logout" && item.label !== "Dashboard" && item.label !== "Sub Admin Manager"))
//   }, [])

//   const onFinish = (values) => {
//     setAdding(true);

//     const data = Object.keys(permission).reduce((result, key) => {
//       if (permission[key].length) {
//         result[key] = permission[key];
//       }
//       return result;
//     }, {});
//     request({
//       url: apiPath.addPermission,
//       method: 'POST',
//       data: {
//         permission: data,
//         user_id: params.id
//       },
//       onSuccess: ({ data, message }) => {
//         setAdding(false);
//         ShowToast(message, Severty.SUCCESS)
//         form.resetFields()

//         setRefresh(prev => !prev)

//       },
//       onError: (error) => {
//         setAdding(false)
//         ShowToast(error, Severty.ERROR)
//       }
//     })
//   }

//   return (
//     <>
//       <Row gutter={[24, 16]} className="subAdminPermission">
//         <Col span={24} xs={24} md={8}>
//           <Card title={sectionName + " Roles and Responsibilities"}>

//             {loading ? [1, 2, 3, 4].map(item => <Skeleton active key={item} />) :
              
//               <Form form={form} onFinish={onFinish} >
//                 {console.log("?????????????????????????")}
//                 {sections?.map(item => (
//                   <Form.Item key={item.key} label={item.label} name={item.key}>
//                     <Sections
//                       item={item}
//                       selected={permission[item.key]}
//                       handleOnChange={handleOnChange}
//                     />
//                   </Form.Item>
//                 ))}

//                 <Form.Item className="mb-0">
//                   <div className="view-inner-cls float-right mb-0">
//                     <Link className="ant-btn ant-btn-primary" to={`/${routeName}`}>Back</Link>
//                     <Button type="primary" loading={loading} htmlType="submit">Submit</Button>
//                   </div>
//                 </Form.Item>
//               </Form>}

//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// }

// const Sections = ({ selected, item, handleOnChange }) => {

//   const [values, setValues] = useState([])

//   useEffect(() => {
//     if (!selected?.length) return setValues([])
//     setValues(selected)
//   }, [selected])


//   return (
//     <Checkbox.Group value={values} onChange={(value) => handleOnChange(value, item.key)}>
//       {
//         item.key !== 'Dashboard' && (
//           <>
//             <Checkbox value="view">View</Checkbox>
//             {!["ContentSection", "SettingSection", "TransactionSection", "SubscriptionOrderSection", "ReferralReportSection", "OnDemandSection", "EmailSection", "NotificationSection"].includes(item.key) && <Checkbox value="add">Add</Checkbox>}
//             {!["NotificationSection", "TransactionSection", "SubscriptionOrderSection", "OnDemandSection", "ReferralReportSection"].includes(item.key) && <Checkbox value="edit">Update</Checkbox>}
//             {/* <Checkbox value="delete">Delete</Checkbox> */}
//           </>
//         )
//       }
//     </Checkbox.Group>
//   )
// }

// export default Permission;
