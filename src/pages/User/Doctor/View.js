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
import moment from "moment";
import DeleteModal from "../../../components/DeleteModal";

function View() {
  const sectionName = "Doctor";
  const routeName = "doctor";
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointment] = useState([]);
  const [doctorAge, setDoctorAge] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showAptDelete, setAptDelete] = useState(false);

  const [selected, setSelected] = useState();
  const [refresh, setRefresh] = useState(false);

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const api = {
    patient: apiPath.listPatient,
  };
  // const onDelete = (id) => {
  //   request({
  //     url: api.patient + "/" + id,
  //     method: "DELETE",
  //     onSuccess: (data) => {
  //       setLoading(false);
  //       setRefresh((prev) => !prev);
  //     },
  //     onError: (error) => {
  //       setLoading(false);
  //       ShowToast(error, Severty.ERROR);
  //     },
  //   });
  // };

  const onDelete = (id) => {
  setLoading(true); 
  request({
    url: api.patient + "/" + id,
    method: "DELETE",
    onSuccess: (data) => {
      ShowToast(data.message, Severty.SUCCESS);
      setShowDelete(false);
      setSelected(null);
      setRefresh((prev) => !prev); 
      setLoading(false); 
    },
    onError: (error) => {
      ShowToast(error, Severty.ERROR);
      setLoading(false); 
    },
  });
};


  const onAptDelete = (id) => {
    request({
      url: api.patient + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewDoctor + id,
      method: "GET",
      onSuccess: ({ status, _doc }) => {
        console.log(_doc);
        if (!status) return;
        setLoading(false);
        setDoctor(_doc);
        setDoctorAge(calculateAge(_doc.dob));
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    fetchData(params.id);
    fetchAppointmentData(params.id);
  }, [refresh]);

  function calculateAge(dob) {
    // Parse the DOB and current date
    const currentDate = new Date();
    const dobDate = new Date(dob);
    const currentDateObj = new Date(currentDate);

    // Calculate the difference in milliseconds
    let ageDiffMs = currentDateObj - dobDate;

    // Convert milliseconds to years, months, and days
    let ageDate = new Date(ageDiffMs);
    let ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
    let ageMonths = ageDate.getUTCMonth();
    let ageDays = ageDate.getUTCDate() - 1; // Subtract 1 to get days, as getUTCDate returns the day of the month (1 to 31)

    return {
      years: ageYears,
      months: ageMonths,
      days: ageDays,
    };
  }

  const AppointmentColumns = [
    {
      title: "Appointment Id",
      key: "appointment_id",
      dataIndex: "appointment_id",
    },
    {
      title: "Patient Name",
      dataIndex: "patient_id",
      key: "patient_id",
      render: (_, { patient_id }) =>
        // <Image width={50} src={image ? apiPath.assetURL + image : notfound} />
        {
          return (
            <Link
              style={{ color: "blue" }}
              to={`/patient/view/${patient_id._id}`}
            >
              {patient_id.name}
            </Link>
          );
        },
    },
    {
      title: "Patient Email",
      dataIndex: "patient",
      key: "patient_id",
      render: (_, { patient_id }) => {
        return patient_id && patient_id.email ? (
          <span className="cap">{patient_id.email}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Appointment Type",
      key: "appointment_type",
      dataIndex: "appointment_type",
    },
    {
      title: "Appointment Category",
      key: "appointment_category",
      dataIndex: "appointment_category",
    },
    {
      title: "Appointment Status",
      key: "appointment_status",
      dataIndex: "appointment_status",
    },
    {
      title: "Status Reason",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "Booked On",
      key: "appointment_date",
      dataIndex: "appointment_date",
      render: (_, { appointment_date }) => {
        return moment(appointment_date).format("DD-MM-YYYY");
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip title={"View Details"} color={"purple"} key={"Delete"}>
              <Button
                title=""
                className="btnStyle primary_btn"
                onClick={() => navigate(`/appointment/view/${record._id}`)}
              >
                <i class="fa fa-light fa-eye" style={{ fontSize: "14px" }}></i>
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  const fetchAppointmentData = (id) => {
    setLoading(true);
    request({
      url: apiPath.viewDoctor + "appointments/" + id,
      method: "GET",
      onSuccess: ({ status, data }) => {
        if (!status) return;
        setLoading(false);
        setAppointment(data);
        fetchPatients(data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchPatients = (data) => {
    const uniquePatients = {};

    // Iterate through each appointment record
    data.forEach((appointment) => {
      const patientId = appointment.patient_id._id;

      // Check if the patient ID is not already present in the uniquePatients object
      if (!uniquePatients.hasOwnProperty(patientId)) {
        // If not present, add the patient details to the object
        uniquePatients[patientId] = {
          _id: patientId,
          uhid: appointment.patient_id.uhid, // Store the entire appointment details
          name: appointment.patient_id.name,
          email: appointment.patient_id.email,
          mobile_number: `${appointment.patient_id.country_code}${appointment.patient_id.mobile_number}`,
        };
      }
    });

    // Convert the object values to an array to get unique patient details
    const uniquePatientsArray = Object.values(uniquePatients);

    setPatients(uniquePatientsArray);
  };
  const patientColumns = [
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      width: 200,
      render: (_, { uhid }) => {
        return uhid;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (_, { name }) => {
        return name ? name : "-";
      },
    },
    {
      title: "Phone Number",
      render: (_, { mobile_number }) => {
        return `+${mobile_number}`;
      },
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
      render: (_, { email }) => {
        return email ? (
          <span style={{ textTransform: "lowercase" }}>{email}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <>
              <Tooltip title={"View Details"} color={"purple"} key={"Delete"}>
                <Button
                  title=""
                  className="btnStyle  primary_btn"
                  onClick={() => navigate(`/patient/view/${record._id}`)}
                >
                  <i
                    className="fa fa-light fa-eye"
                    style={{ fontSize: "14px" }}
                  ></i>
                </Button>
              </Tooltip>
              <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
                <Button
                  title="Delete"
                  className="delete-cls ail"
                  onClick={() => {
                    setSelected(record);
                    setShowDelete(true);
                  }}
                >
                  {/* <img src={deleteWhiteIcon} /> */}
                  <i class="fa fa-light fa-trash"></i>
                </Button>
              </Tooltip>
            </>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={16}>
        <Col span={24} xs={24}>
          <Card title={sectionName + " Details"}>
            <div className="card-data-user-image-image card-data-user-image-image-new-image">
              <div className="card-data-user-image">
                {doctor?.image ? (
                  <img src={doctor?.image} />
                ) : (
                  <>
                    <Avatar
                      style={{
                        backgroundColor: "#00a2ae",
                        verticalAlign: "middle",
                      }}
                      className="cap"
                      size={60}
                    >
                      {" "}
                      {doctor?.name?.charAt(0)}{" "}
                    </Avatar>
                  </>
                )}
              </div>
              <div className="card-data-user">
                <h3>{doctor?.name ? doctor?.name : ""}</h3>
                <h3>{doctor?.email ? doctor?.email : doctor?.email}</h3>
                <h6>Doctor ID : {doctor?.uhid ? doctor?.uhid : ""}</h6>
              </div>
            </div>

            {loading ? (
              [1, 2, 3].map((item) => <Skeleton active key={item} />)
            ) : (
              <div className="view-main-list ">
                {doctor?.degree ? (
                  <div className="view-inner-cls">
                    <h5>Degree:</h5>
                    {doctor && doctor.degree ? (
                      <h6>
                        <div className="pdf-icons">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <h6>
                          <a
                            href={doctor.degree}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View{" "}
                            {decodeURIComponent(doctor.degree.split("/").pop())}
                          </a>
                        </h6>
                      </h6>
                    ) : null}
                  </div>
                ) : (
                  ""
                )}

                {doctor?.document?.length ? (
                  <div className="view-inner-cls">
                    <h5>Registration Certificate:</h5>
                    {doctor
                      ? doctor?.document?.map((doc) => (
                          <h6>
                            <div className="pdf-icons">
                              {" "}
                              <i class="fas fa-file-pdf"></i>
                            </div>
                            <h6>
                              {console.log(doc, "ggggggggggg>>>>>>>.")}
                              <a
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View {decodeURIComponent(doc?.split("/").pop())}
                              </a>
                            </h6>
                          </h6>
                        ))
                      : ""}
                  </div>
                ) : (
                  ""
                )}
              </div>
            )}
          </Card>
        </Col>
        <div className="float-end mt-3 w-100 text-right">
          <Button
            className="primary_btn btnStyle"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
      </Row>

      <Card className="mt-3" title="Appointments">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={AppointmentColumns}
                  dataSource={appointments}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card className="mt-3" title="Patients">
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs={24} xl={24}>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={patientColumns}
                  dataSource={patients}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Col>
          </Row>
        </div>
      </Card>
      {showDelete && (
        <DeleteModal
          title={"Delete Patient"}
          subtitle={`Are you sure you want to Delete this patient?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
      {showAptDelete && (
        <DeleteModal
          title={"Delete Patient"}
          subtitle={`Are you sure you want to Delete this patient?`}
          show={showAptDelete}
          hide={() => {
            setAptDelete(false);
            setSelected();
          }}
          onOk={() => onAptDelete(selected?._id)}
        />
      )}
    </>
  );
}

export default View;
