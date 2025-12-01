import {
  Row,
  Col,
  Card,
  Button,
  Skeleton,
  Avatar,
  Image,
  Tooltip,
  Table,
  Tag,
} from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useRequest from "../../../hooks/useRequest";
import { ShowToast, Severty } from "../../../helper/toast";
import apiPath from "../../../constants/apiPath";
import { Badge } from "antd";
import moment from "moment";
import notfound from "../../../assets/images/not_found.png";
import { QuoteStatus } from "../../DeliveryHistory/Index";

function View() {
  const sectionName = "Sub Admin";
  const routeName = "sub-admin";
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewSubAdmin + id,
      method: "GET",
      onSuccess: ({ status, _doc }) => {
        console.log(_doc);
        if (!status) return;
        setLoading(false);
        setPatient(_doc);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    fetchData(params.id);
  }, []);

  const AppointmentColumns = [
    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      render: (_, { name }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        name,
    },
    {
      title: "Ailments",
      dataIndex: "ailments",
      key: "ailments",
      render: (_, { make_id }) => {
        return make_id ? <span className="cap">{make_id?.name}</span> : "-";
      },
    },
    {
      title: "Doctor Notes",
      dataIndex: "doctor_notes",
      key: "doctor_notes",
      render: (_, { model_id }) => {
        return model_id && model_id.name ? (
          <span className="cap">{model_id.name}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Appointment Type",
      key: "appointment_type",
      dataIndex: "appointment_type",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Booked For",
      dataIndex: "booked_for",
      key: "booked_for",
      render: (_, { booked_for }) => {
        return booked_for ? <span className="cap">{booked_for}</span> : "-";
      },
    },
    {
      title: "Booked On",
      key: "booked_on",
      dataIndex: "booked_on",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Created On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
  ];

  const MedicineColumns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        `${
          pagination.current === 1
            ? index + 1
            : (pagination.current - 1) * 10 + (index + 1)
        }`,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name ? name : "-";
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, { part_type }) => {
        return part_type ? <span className="cap">{part_type}</span> : "-";
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, { status, _id }) => {
        let color =
          status === "complete"
            ? "green"
            : status === QuoteStatus.REQUEST
            ? "yellow"
            : status === QuoteStatus.RECEIVED
            ? "blue"
            : "magenta";
        return (
          <a>
            <Tag
              onClick={(e) =>
                !(status === QuoteStatus.FULLFILL)
                  ? /* changeStatus(_id) */ null
                  : null
              }
              color={color}
              key={status}
            >
              {status === QuoteStatus.REQUEST
                ? "Request"
                : status === QuoteStatus.RECEIVED
                ? "Received"
                : status === QuoteStatus.FULLFILL
                ? "Requirement FullFilled"
                : null}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "Ordered On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View Quote" color={"purple"} key={"viewquote"}>
              <Button onClick={(e) => navigate(`/quote/view/${record._id}`)}>
                <i className="fa fa-light fa-eye"></i>
              </Button>
            </Tooltip>
            {/* {
              record.status == QuoteStatus.RECEIVED &&
              <Tooltip title="View Quote Reply" color={"purple"} key={"viewquote"}>
                <Button onClick={(e) => {
                  setSelectedQuote(record._id)
                  showModal(true)
                }}>
                  <i className="fa fa-light fa-eye"></i>
                </Button>
              </Tooltip>
            } */}
          </>
        );
      },
    },
  ];

  const AilmentColumns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        `${
          pagination.current === 1
            ? index + 1
            : (pagination.current - 1) * 10 + (index + 1)
        }`,
    },
    {
      title: "Part Number",
      dataIndex: "part_number",
      key: "part_number",
      render: (_, { part_number, _id }) => {
        return part_number ? part_number : "-";
      },
    },
    {
      title: "Part Type",
      dataIndex: "part_type",
      key: "part_type",
      render: (_, { part_type }) => {
        return part_type ? <span className="cap">{part_type}</span> : "-";
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, { status, _id }) => {
        let color =
          status === "complete"
            ? "green"
            : status === QuoteStatus.REQUEST
            ? "yellow"
            : status === QuoteStatus.RECEIVED
            ? "blue"
            : "magenta";
        return (
          <a>
            <Tag
              onClick={(e) =>
                !(status === QuoteStatus.FULLFILL)
                  ? /* changeStatus(_id) */ null
                  : null
              }
              color={color}
              key={status}
            >
              {status === QuoteStatus.REQUEST
                ? "Request"
                : status === QuoteStatus.RECEIVED
                ? "Received"
                : status === QuoteStatus.FULLFILL
                ? "Requirement FullFilled"
                : null}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "Quote On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="View Quote" color={"purple"} key={"viewquote"}>
              <Button onClick={(e) => navigate(`/quote/view/${record._id}`)}>
                <i className="fa fa-light fa-eye"></i>
              </Button>
            </Tooltip>
            {/* {
              record.status == QuoteStatus.RECEIVED &&
              <Tooltip title="View Quote Reply" color={"purple"} key={"viewquote"}>
                <Button onClick={(e) => {
                  setSelectedQuote(record._id)
                  showModal(true)
                }}>
                  <i className="fa fa-light fa-eye"></i>
                </Button>
              </Tooltip>
            } */}
          </>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={24} xs={24}>
       
          <Card title={sectionName + " Details"}>
            {loading ? (
              [1, 2, 3].map((item) => <Skeleton active key={item} />)
            ) : (
              <div className="view-main-patient">
                <div className="view-inner-cls">
                  <h5>Image:</h5>
                  <h6>
                    {patient && !patient.image ? (
                      <Avatar
                        style={{
                          backgroundColor: "#00a2ae",
                          verticalAlign: "middle",
                        }}
                        className="cap"
                        size={50}
                      >
                        {patient?.name?.charAt(0)}
                      </Avatar>
                    ) : (
                      <Image className="image-radius" src={patient.image} />
                    )}
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Name:</h5>
                  <h6>
                    <span className="cap">
                      {patient.name ? patient.name : "-"}
                    </span>
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Email Address:</h5>
                  <h6>{patient.email ? patient.email : "-"}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Phone Number:</h5>
                  <h6>
                    {patient ? "+" + patient.country_code + "-" : "+965"}
                    {patient ? patient.mobile_number : "-"}
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Gender:</h5>
                  <h6>
                    <span className="cap">
                      {patient.gender ? patient.gender : "-"}
                    </span>
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Location:</h5>
                  <h6>{patient.location ? patient.location : "-"}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Added By:</h5>
                  <h6>{patient.added_by ? patient.added_by : "-"}</h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Status:</h5>
                  <h6>
                    {patient.is_active ? (
                      <Badge status="success" text="Active" />
                    ) : (
                      <Badge status="error" text="InActive" />
                    )}
                  </h6>
                </div>

                <div className="view-inner-cls">
                  <h5>Registered On:</h5>
                  <h6>
                    {patient.created_at
                      ? moment(patient.created_at).format("DD-MM-YYYY")
                      : "-"}
                  </h6>
                </div>

              
              </div>
            )}
          </Card>

        </Col>
        <div className="float-end mt-3 w-100 text-right">
        <Button className="primary_btn btnStyle " onClick={()=> navigate("/sub-admin")}>Back</Button>
        </div>
      </Row>

      {/* <Card className="mt-3" title="Appointments">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={AppointmentColumns}
                  dataSource={[]}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="mt-3" title="Products">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={MedicineColumns}
                  dataSource={[]}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card> */}

      {/* <Card className="mt-3" title="Ailments">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={AilmentColumns}
                  dataSource={[]}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card> */}
    </>
  );
}

export default View;
