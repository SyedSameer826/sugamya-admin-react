import { Row, Col, Card, Button, Skeleton, Image, Divider } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useRequest from "../../../hooks/useRequest";
import { ShowToast, Severty } from "../../../helper/toast";
import apiPath from "../../../constants/apiPath";
import { Badge } from "antd";
import moment from "moment";
import notfound from "../../../assets/images/not_found.png";
import { useReactToPrint } from "react-to-print";
// import pdffile from "../../assets/images/pdf-file.png";
function Case() {
  const sectionName = "Case ";
  const routeName = "appointments";

  const params = useParams();
  const { request } = useRequest();
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const contentToPrint = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location?.state?.data;

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: `${moment().format("DD-MM-YYYY")}_case paper_${stateData?.uhid}_${stateData?.name}  `,
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  const fetchData = (id) => {
    request({
      url: apiPath.casePaper + "/" + id,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setList(data.caseData);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  console.log("list::::::::::::::::::::::", list);
  console.log("check console", list);

  useEffect(() => {
    setLoading(true);
    fetchData(params.id);
  }, []);

  const downloadPdf = (id) => {
    setPdfLoading(true);
    request({
      url: apiPath.downloadCase + "/" + params.id,
      method: "GET",
      onSuccess: (data) => {
        if (data && data.data) {
          const pdfUrl = data.data; // This is the direct bucket URL

          // Fetch the file as a blob
          fetch(pdfUrl)
            .then((response) => {
              if (!response.ok) {
                setPdfLoading(false);
                throw new Error("Network response was not ok");
              }
              setPdfLoading(false);
              return response.blob();
            })
            .then((blob) => {
              // Create a download link for the blob
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;

              // Set a fixed file name
              link.download = `${moment().format("DD-MM-YYYY")}_case-paper_${stateData?.uhid}_${stateData?.name}`;

              // Trigger download
              document.body.appendChild(link);
              link.click();

              // Clean up
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              setPdfLoading(false);
            })
            .catch((error) => {
              setPdfLoading(false);
              console.error("Error downloading the file:", error);
              ShowToast("Failed to download the PDF.", Severty.ERROR);
            });
        } else {
          setPdfLoading(false);
          ShowToast("Invalid URL or data.", Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const correctApptime = (appointment_time) => {
    const timeInLocal = moment.utc(appointment_time, "HH:mm").local();
    return timeInLocal.isValid() ? timeInLocal.format("hh:mm A") : "-";
  };

  return (
    <>
      <Card
        className="appointmrnt-h"
        title={"Case" + " Details"}
        extra={
          <>
            <Button
              className="button-print-now primary_btn btnStyle"
              // onClick={() => handlePrint(null, () => contentToPrint.current)}
              loading={pdfLoading}
              disabled={pdfLoading}
              onClick={() => downloadPdf()}
            >
              <i className="fas fa-print"></i>
            </Button>
          </>
        }
        ref={contentToPrint}
        style={{ whiteSpace: "pre-wrap" }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12} xs={24} md={24}>
            {loading ? (
              <Skeleton active />
            ) : (
              <>
                <div className="Case-main-list mb-3">
                  <div className="view-inner-cls1">
                    <div className="main-new-case-paper-view-page cap">
                      <Row gutter={[16, 16]}>
                        <Col span={24} md={12} xl={8}>
                          <Card title="Basic Details">
                            <p>
                              <span>UHID</span>{" "}
                              {list?.patient_id ? list?.patient_id.uhid : "-"}
                            </p>
                            <p>
                              <span>Name</span>{" "}
                              {list?.patient_id ? list?.patient_id.name : "-"} (
                              {list?.patient_id ? list?.patient_id.age : "-"})
                            </p>
                            <p>
                              <span>Gender</span>{" "}
                              {list?.patient_id ? list?.patient_id.gender : "-"}
                            </p>
                            <p>
                              <span>Country</span>{" "}
                              {list?.patient_id
                                ? list?.patient_id.country.name
                                : "-"}
                            </p>
                            <p>
                              <span>Referred By</span>{" "}
                              {list ? list?.referredBy : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Appointment ID </span>{" "}
                              {list?.appointment_id
                                ? list?.appointment_id?.appointment_id
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Appointment Date </span>{" "}
                              {list?.appointment_id
                                ? moment(
                                    list?.appointment_id?.appointment_date,
                                  ).format("DD-MM-YYYY")
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Appointment Time </span>{" "}
                              {list?.appointment_id
                                ? correctApptime(
                                    list?.appointment_id?.appointment_time,
                                  )
                                : "-"}
                            </p>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Present Complaints">
                            <span>{list ? list.present_complaints : "-"}</span>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Past History">
                            {list
                              ? list.past_history?.map((lst) => (
                                  <span>{lst}</span>
                                ))
                              : "-"}
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Current and Past Medication">
                            <span>
                              {list ? list.current_and_pastMedication : "-"}
                            </span>
                            {/* <span>Multivitamins</span> */}
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Family History">
                            <p>
                              <span>Father</span>{" "}
                              {list?.family_history?.length > 0
                                ? list.family_history[0].father_name
                                : "-"}
                            </p>
                            <p>
                              <span>Mother</span>{" "}
                              {list?.family_history?.length > 0
                                ? list.family_history[0].mother_name
                                : "-"}
                            </p>
                            <p>
                              <span>Sister</span>{" "}
                              {list?.family_history?.length > 0
                                ? list.family_history[0].sister_name
                                : "-"}
                            </p>
                            <p>
                              <span>Brother</span>{" "}
                              {list?.family_history?.length > 0
                                ? list.family_history[0].brother_name
                                : "-"}
                            </p>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Dinacharya">
                            <p>
                              <span>Wake up at</span>{" "}
                              {list?.dincharya?.length > 0
                                ? moment(list.dincharya[0].wakeup_at_AM).format(
                                    "hh:mm A",
                                  )
                                : "-"}
                            </p>
                            <p>
                              <span>Sleeps at</span>{" "}
                              {list?.dincharya?.length > 0
                                ? moment(list.dincharya[0].sleeps_at_PM).format(
                                    "hh:mm A",
                                  )
                                : "-"}
                            </p>
                            <p>
                              <span>Exercise</span>{" "}
                              {list?.dincharya?.length > 0
                                ? list.dincharya[0].exercise
                                : "-"}
                            </p>
                            <p>
                              <span>Job Profile</span>{" "}
                              {list?.dincharya?.length > 0
                                ? list.dincharya[0].job_profile
                                : "-"}
                            </p>
                            <p>
                              <span>Hunger</span>{" "}
                              {list?.dincharya?.length > 0
                                ? list.dincharya[0].hunger
                                : "-"}
                            </p>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Diet">
                            <div className="input-group">
                              <label>Sweets</label>
                              <p>
                                {list?.diet?.length > 0
                                  ? list.diet[0].sweets
                                  : "-"}
                              </p>
                            </div>
                            <div className="input-group">
                              <label>Hot and Spicy</label>
                              <p>
                                {list?.diet?.length > 0
                                  ? list.diet[0].hot_and_spicy
                                  : "-"}
                              </p>
                            </div>
                            <div className="input-group">
                              <label>NonVeg/Veg </label>
                              <p>
                                {"  "}
                                {list?.diet?.length > 0
                                  ? list.diet[0].food_type
                                  : "-"}
                              </p>
                            </div>
                            <div className="input-group">
                              <label>Stale Food</label>
                              <p>
                                {list?.diet?.length > 0
                                  ? list.diet[0].stale_food
                                  : "-"}
                              </p>
                            </div>
                            <div className="input-group">
                              <label>Hoteling</label>
                              <p>
                                {list?.diet?.length > 0
                                  ? list.diet[0].hoteling
                                  : "-"}
                              </p>
                            </div>
                            <div className="diet-item">
                              <h3>Tea/Coffee/Milk -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  {list?.diet[0]?.tea?.length > 0
                                    ? moment(list.diet[0].tea[0].time).format(
                                        "hh:mm A",
                                      )
                                    : "-"}
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details </label>
                                <p>
                                  {list?.diet[0]?.tea?.length > 0
                                    ? list.diet[0].tea[0].enter
                                    : "-"}
                                </p>
                              </div>
                            </div>

                            <div className="diet-item">
                              <h3>Breakfast -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  <p>
                                    {list?.diet[0].breakfast[0]
                                      ? moment(
                                          list.diet[0].breakfast[0].time,
                                        ).format("hh:mm A")
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details</label>
                                <p>
                                  <p>
                                    {list?.diet[0].breakfast[0]
                                      ? list.diet[0].breakfast[0].enter
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                            </div>

                            <div className="diet-item">
                              <h3>Lunch -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  <p>
                                    {list?.diet[0].lunch[0]
                                      ? moment(
                                          list.diet[0].lunch[0].time,
                                        ).format("hh:mm A")
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details</label>
                                <p>
                                  <p>
                                    {list?.diet[0].lunch[0]
                                      ? list.diet[0].lunch[0].enter
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                            </div>

                            <div className="diet-item">
                              <h3>Snacks -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  <p>
                                    {list?.diet[0].snacks[0]
                                      ? moment(
                                          list.diet[0].snacks[0].time,
                                        ).format("hh:mm A")
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details</label>
                                <p>
                                  <p>
                                    {list?.diet[0].snacks[0]
                                      ? list.diet[0].snacks[0].enter
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                            </div>

                            <div className="diet-item">
                              <h3>Dinner -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  <p>
                                    {list?.diet[0].dinner[0]
                                      ? moment(
                                          list.diet[0].dinner[0].time,
                                        ).format("hh:mm A")
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details</label>
                                <p>
                                  <p>
                                    {list?.diet[0].dinner[0]
                                      ? list.diet[0].dinner[0].enter
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                            </div>
                            <div className="diet-item">
                              <h3>Other -</h3>
                              <div className="input-group">
                                <label>Time</label>
                                <p>
                                  <p>
                                    {list?.diet[0].any_other_food[0]
                                      ? moment(
                                          list.diet[0].any_other_food[0].time,
                                        ).format("hh:mm A")
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                              <div className="input-group">
                                <label>Details</label>
                                <p>
                                  <p>
                                    {list?.diet[0].any_other_food[0]
                                      ? list.diet[0].any_other_food[0].enter
                                      : "-"}
                                  </p>
                                </p>
                              </div>
                            </div>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Other Details">
                            <p>
                              <span>Bowel Habit</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].bowel_habit
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Urination</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].urination
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Nocturnal Urination</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].nocturnal_urination
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Menstrual History</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].menstrual_history
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Sleep</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].sleep
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Day Time Sleep</span>{" "}
                              {list?.other_details[0]
                                ? moment(
                                    list.other_details[0].day_time_sleep,
                                  ).format("hh:mm A")
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Mental Stress </span>
                              {list?.other_details[0]
                                ? list.other_details[0].mental_stress
                                : "-"}
                            </p>
                            <p>
                              {" "}
                              <span> Addictions</span>{" "}
                              {list?.other_details[0]
                                ? list.other_details[0].addictions
                                : "-"}
                            </p>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Physical Examination">
                            <p>
                              <span> Jivha</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].jivha
                                : "-"}
                            </p>
                            <p>
                              <span> Nadi</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].nadi
                                : "-"}
                            </p>
                            <p>
                              <span> Aakruti</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].aakruti
                                : "-"}
                            </p>
                            <p>
                              <span> Shabda</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].shabda
                                : "-"}
                            </p>
                            <p>
                              <span> Pulse</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].pulse
                                : "-"}
                            </p>
                            <p>
                              <span> Sparsha</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].sparsha
                                : "-"}
                            </p>
                            <p>
                              <span> BP</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].bp
                                : "-"}
                            </p>
                            <p>
                              <span> Weight</span>{" "}
                              {list?.physical_examination[0]
                                ? list.physical_examination[0].weight
                                : "-"}
                            </p>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Investigations">
                            <span>{list ? list.investigation : "-"}</span>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Diagnosis">
                            <div className="maain-new-treatement-class-listhh">
                              <ul>
                                {list
                                  ? list.diagnosis.map((lst) => <li>{lst}</li>)
                                  : "-"}
                              </ul>
                            </div>
                          </Card>
                        </Col>

                        <Col span={24} md={12} xl={8}>
                          <Card title="Treatment">
                            {" "}
                            <div className="maain-new-treatement-class-listhh">
                              <ul>
                                {/* {list
                                  ? list.treatment.map((lst) => <li>{lst}</li>)
                                  : "-"} */}

                                {list
                                  ? list?.treatment.length > 0
                                    ? list.treatment.map((lst) => (
                                        <li>{lst}</li>
                                      ))
                                    : list?.treatment[0]
                                        ?.split("\n")
                                        .map((lst, index) => (
                                          <li key={index}>{lst}</li>
                                        ))
                                  : "-"}
                              </ul>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
                <div className="view-inner-cls float-right">
                  <Link
                    className="ant-btn ant-btn-primary"
                    onClick={() => navigate(-1)}
                    to={""}
                  >
                    Back
                  </Link>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default Case;
