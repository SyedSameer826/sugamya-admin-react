import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Form,
  Skeleton,
  Image,
  Divider,
} from "antd";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import moment from "moment";
import notfound from "../../assets/images/no-image.png";
import SingleImageUpload from "../../components/SingleImageUpload";
const endpoint = "https://s3-noi.aces3.ai/sugamaya-bucket/";

function View() {
  const [formKey, setFormKey] = useState(0);
  const [form] = Form.useForm();

  const sectionName = "Appointment";
  const routeName = "appointments";

  const params = useParams();
  const [uploadLabReport, setUploadLabReport] = useState();
  const { request } = useRequest();
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(true);
  // const [follow,setFollowUp] = useState()
  // const [caseDetail,setCaseDetail] = useState({})
  const [isEditable, setIsEditable] = useState(true); // State to manage form editability
  const navigate = useNavigate();
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
    "image/avif",
    "application/msword",
    "image/webp",
    "image/gif",
  ];
  const fetchData = (id) => {
    request({
      url: apiPath.viewAppointment + "/" + id,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data[0]);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleImage = (data, type) => {
    console.log("data", data);

    if (!data || data.length === 0) {
      console.log("File removed, no upload needed.");
      return;
    }

    const newData = data[0].url.split("sugamaya-bucket/");
    let payload = {};

    if (type === "precriptionPdf") {
      payload = { precriptionPdf: newData[1] };
    } else if (type === "advisoryNotes") {
      payload = { advisoryNotes: newData[1] };
    } else {
      payload = { labReports: newData[1] };
    }

    request({
      url: apiPath.updateAppointment + "/" + params.id,
      method: "PUT",
      data: payload,
      onSuccess: (data) => {
        ShowToast("Lab Report Uploaded Successfully", Severty.SUCCESS);
        fetchData(params.id);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(params.id);
  }, []);

  return (
    <>
      <Card className="appointmrnt-h" title={sectionName + " Details"}>
        <Row gutter={16}>
          <Col span={12} xs={24} md={24}>
            {loading ? (
              <Skeleton active />
            ) : (
              <div className="view-main-list">
                <div className="view-inner-cls">
                  <h5>Appointment Id:</h5>
                  <h6 className="cap">
                    {list?.appointment_id ? list?.appointment_id : "-"}
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Doctor: </h5>
                  <h6 className="cap">
                    <Image
                      className="imagefix"
                      src={
                        list && list?.doctor && list.doctor.image
                          ? list?.doctor?.image
                          : notfound
                      }
                    />

                    <Link to={`/doctor/view/${list?.doctor?._id}`}>
                      {list?.doctor ? list?.doctor.name : "-"}
                    </Link>
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Patient:</h5>
                  <h6 className="cap">
                    <Image
                      className="imagefix"
                      src={
                        list &&
                        list?.patient_details &&
                        list.patient_details.image
                          ? `${list.patient_details.image}`
                          : notfound
                      }
                    />

                    <Link to={`/patient/view/${list?.patient_details?._id}`}>
                      {list?.patient_details
                        ? list?.patient_details?.name
                        : "-"}
                    </Link>
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Charges:</h5>
                  <h6 className="cap">${list?.price ? list?.price : "-"}</h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Appointment Date:</h5>
                  <h6 className="cap">
                    {list?.appointment_date
                      ? moment.utc(list?.appointment_date).format("DD-MM-YYYY hh:mm A")
                      : "-"}
                  </h6>
                </div>
                {/* <div className="view-inner-cls">
                  <h5>Appointment Time:</h5>
                  <h6 className="cap">{list?.appointment_time ? (list?.appointment_time) : '-'}</h6>
                </div> */}
                <div className="view-inner-cls">
                  <h5>Appointment Type:</h5>
                  <h6 className="cap">
                    {list?.appointment_type ? list?.appointment_type : "-"}
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Appointment Status:</h5>
                  <h6 className="cap">
                    {list?.appointment_status ? list?.appointment_status : "-"}
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Appointment Category:</h5>
                  <h6 className="cap">
                    {list?.appointment_category
                      ? list?.appointment_category
                      : "-"}
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Current Status:</h5>
                  <h6 className="cap">{list?.status ? list?.status : "-"}</h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Brief of Health Complaint:</h5>
                  <h6 className="cap">
                    {list?.description ? list?.description : "-"}
                  </h6>
                </div>
                <div className="view-inner-cls">
                  <h5>Documentation Advice:</h5>
                  <h6 className="cap">
                    {list?.documentation ? list?.documentation : "-"}
                  </h6>
                </div>
                <div style={{ borderBottom: "1px solid #f1f1f1", paddingBottom: "2px" }}>
                  <h5 style={{ fontSize: "15px", fontWeight: "bold" }}>
                    Doctor ScreenShot
                  </h5>
                  {list?.shots?.map((shot) => (
                    <Image
                      width={50}
                      height={50}
                      src={shot.images.startsWith("http") ? shot.images : apiPath.assetURL + shot.images}
                    />
                  ))}

                </div>
                <div className="view-inner-cls">
                  <h5>Created On:</h5>
                  <h6>
                    {list?.created_at
                      ? moment(list?.created_at).format("DD-MM-YYYY hh:mm A")
                      : "-"}
                  </h6>
                </div>

                <div className="pdf-view">
                  <div className="view-inner-view">
                    <h5>Precription:</h5>
                    {list?.precriptionPdf ? (
                      <>
                        <div className="pdf-icons">
                          {" "}
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <h6>
                          {/* <a
                            href={endpoint + list?.precriptionPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Precription
                          </a> */}

                          <a
                            href="#"
                            onClick={async (e) => {
                              console.log("patient>>>", list?.precriptionPdf);
                              e.preventDefault();

                              try {
                                const response = await fetch(
                                  endpoint + list?.precriptionPdf,
                                );
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const formattedDate =
                                  moment().format("DD-MM-YYYY"); // Get current date in YYYY_MM_DD format
                                const fileName = `${formattedDate}_${list?.patient_details?.uhid}_${list?.patient_details?.name}_precription.pdf`;
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.setAttribute("download", fileName); // Ensuring download attribute
                                document.body.appendChild(a);
                                a.click(); // Programmatically triggering download
                                document.body.removeChild(a);

                                //  window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Error downloading file:", error);
                              }
                            }}
                          >
                            {/* <a
                            href={endpoint + list?.advisoryNotes}
                            target="_blank"
                            rel="noopener noreferrer"
                          > */}
                            View Prescription
                          </a>
                        </h6>
                      </>
                    ) : (
                      ""
                    )}
                    <div className="appointment-upload-buttn">
                      <SingleImageUpload
                        fileType={FileType}
                        imageType={"document"}
                        btnName={""}
                        onChange={(data) => handleImage(data, "precriptionPdf")}
                      />
                    </div>
                  </div>

                  <div className="view-inner-view">
                    <h5>Advisory Notes:</h5>
                    {list?.advisoryNotes ? (
                      <>
                        <div className="pdf-icons">
                          {" "}
                          <i className="far fa-file"></i>
                        </div>
                        <h6>
                          <a
                            href="#"
                            onClick={async (e) => {
                              console.log("patient>>>", list?.patient_details);
                              e.preventDefault();

                              try {
                                const response = await fetch(
                                  endpoint + list?.advisoryNotes,
                                );
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const formattedDate =
                                  moment().format("DD-MM-YYYY"); // Get current date in YYYY_MM_DD format
                                const fileName = `${formattedDate}_${list?.patient_details?.uhid}_${list?.patient_details?.name}_advisoryNotes.pdf`;
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.setAttribute("download", fileName); // Ensuring download attribute
                                document.body.appendChild(a);
                                a.click(); // Programmatically triggering download
                                document.body.removeChild(a);

                                //  window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Error downloading file:", error);
                              }
                            }}
                          >
                            {/* <a
                            href={endpoint + list?.advisoryNotes}
                            target="_blank"
                            rel="noopener noreferrer"
                          > */}
                            View Notes
                          </a>
                        </h6>
                      </>
                    ) : (
                      ""
                    )}
                    <div className="appointment-upload-buttn">
                      <SingleImageUpload
                        fileType={FileType}
                        imageType={"document"}
                        btnName={""}
                        onChange={(data) => handleImage(data, "advisoryNotes")}
                      />
                    </div>
                  </div>

                  <div className="view-inner-view">
                    <h5>Lab Reports:</h5>
                    {list?.labReports ? (
                      <>
                        {" "}
                        <div className="pdf-icons">
                          {" "}
                          <i className="far fa-file-alt"></i>{" "}
                        </div>
                        <h6>
                          <a
                            href="#"
                            onClick={async (e) => {
                              console.log("patient>>>", list?.patient_details);
                              e.preventDefault();

                              try {
                                const response = await fetch(
                                  endpoint + list?.labReports,
                                );
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const formattedDate =
                                  moment().format("DD-MM-YYYY"); // Get current date in YYYY_MM_DD format
                                const fileName = `${formattedDate}_${list?.patient_details?.uhid}_${list?.patient_details?.name}_labReport.pdf`;
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.setAttribute("download", fileName); // Ensuring download attribute
                                document.body.appendChild(a);
                                a.click(); // Programmatically triggering download
                                document.body.removeChild(a);

                                //  window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Error downloading file:", error);
                              }
                            }}
                          >
                            {/* <a
                            href={endpoint + list?.labReports}
                            target="_blank"
                            rel="noopener noreferrer"
                          > */}
                            View Lab Reports
                          </a>
                        </h6>
                      </>
                    ) : (
                      ""
                    )}

                    {/* <Button
                      className="ant-btn ant-btn-primary"
                      onClick={() => {
                        setFormKey((prevKey) => prevKey + 1);
                        setIsEditable(!isEditable); // Toggle editability
                      }}
                    > */}
                    <div className="appointment-upload-buttn">
                      <SingleImageUpload
                        fileType={FileType}
                        imageType={"document"}
                        btnName={""}
                        onChange={(data) => handleImage(data)}
                      />
                    </div>
                    {/* </Button> */}
                  </div>

                  <div className="view-inner-view">
                    <h5>Patient documents:</h5>

                    {list?.otherDoc?.length > 0
                      ? list?.otherDoc?.map((doc) => (
                        <h6>
                          <a
                            href="#"
                            onClick={async (e) => {
                              console.log(
                                "patient>>>",
                                list?.patient_details,
                              );
                              e.preventDefault();

                              try {
                                const response = await fetch(endpoint + doc);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const formattedDate =
                                  moment().format("DD-MM-YYYY"); // Get current date in YYYY_MM_DD format
                                const fileName = `${formattedDate}_${list?.patient_details?.uhid}_${list?.patient_details?.name}_otherDocument.${doc.split('.').pop()}`;
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.setAttribute("download", fileName); // Ensuring download attribute
                                document.body.appendChild(a);
                                a.click(); // Programmatically triggering download
                                document.body.removeChild(a);

                                //  window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error(
                                  "Error downloading file:",
                                  error,
                                );
                              }
                            }}
                          >
                            {/* <a
                              href={endpoint + doc}
                              target="_blank"
                              rel="noopener noreferrer"
                            > */}
                            <div className="pdf-icons">
                              {" "}
                              <i className="far fa-file-alt"></i>{" "}
                            </div>
                            View Patient documents:
                          </a>
                        </h6>
                      ))
                      : "-"}
                    <div></div>
                  </div>
                  <div className="view-inner-cls float-right">
                    <Link
                      className="ant-btn ant-btn-primary"
                      to={""}
                      onClick={() => navigate(-1)}
                    >
                      Back
                    </Link>
                  </div>
                </div>

                {/* {list?.followUp && <div className="main-follow-up-img">
       <div className="ant-card-head">
            <div className="ant-card-head-title">Follow-up form</div>
          </div>
      <Form key={formKey} id="create" form={form} layout="vertical">
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Form.Item label="C/o" name="c_o" value={list?.followUp?.c_o}>
        {list?.followUp.c_o}
        </Form.Item>
        
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Nadi" name="nadi">
          <Input placeholder="Nadi" disabled={true} value={list?.followUp.nadi} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Mala" name="mala">
          <Input placeholder="Mala" disabled={true} value={list?.followUp.mala} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Mutra" name="mutra">
          <Input placeholder="Mutra" disabled={true} value={list?.followUp.mutra} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Nidra" name="nidra">
          <Input placeholder="Nidra" disabled={true} value={list?.followUp.nidra} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Menstrual History" name="menstrual_history">
          <Input placeholder="Menstrual History" disabled={true} value={list?.followUp.menstrual_history} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Other Findings" name="other_findings">
          <Input placeholder="Other Findings" disabled={true} value={list?.followUp.other_findings} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Investigation" name="investigation">
          <Input placeholder="Investigation" disabled={true} value={list?.followUp.investigation} />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Treatment" name="treatment">
          <Input placeholder="Treatment" disabled={true} value={list?.followUp.treatment} />
        </Form.Item>
      </Col>
    </Row>
   
  </Form>   
    </div>

} */}

                {list?.followUp && (
                  <div className="Case-main-list mb-3">
                    <Card>
                      <div className="main-follow-up-img">
                        <div className="ant-card-head">
                          <div className="ant-card-head-title">
                            Follow-up form
                          </div>
                        </div>
                        {/* <Collapse defaultActiveKey={['1']} expandIconPosition="right" > */}
                        <Form
                          key={"formKey"}
                          id="create"
                          form={form}
                          layout="vertical"
                          disabled
                          initialValues={{ ...list?.followUp }}
                        >
                          <Row gutter={[48, 12]} className="pt-3 m-0">
                            <Col span={24} md={12}>
                              <Form.Item label="C/o" name="c_o">
                                <Input placeholder="C/o" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item label="Nadi" name="nadi">
                                <Input placeholder="Nadi" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item label="Mala" name="mala">
                                <Input placeholder="Mala" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item label="Mutra" name="mutra">
                                <Input placeholder="Mutra" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item label="Nidra" name="nidra">
                                <Input placeholder="Nidra" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item
                                label="Menstrual History"
                                name="menstrual_history"
                              >
                                <Input placeholder="Menstrual History" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item
                                label="Other Findings"
                                name="other_findings"
                              >
                                <Input placeholder="Other Findings" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item
                                label="Investigation"
                                name="investigation"
                              >
                                <Input placeholder="Investigation" />
                              </Form.Item>
                            </Col>

                            <Col span={24} md={12}>
                              <Form.Item label="Treatment" name="treatment">
                                <Input placeholder="Treatment" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default View;
