import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Upload,
  Select,
  Space,
  TimePicker,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";
import DeleteIcon from "../../../assets/images/delete.svg";
import { Severty, ShowToast } from "../../../helper/toast";
import useRequest from "../../../hooks/useRequest";

const weekdays = [
  { name: "Sunday", label: "Sunday" },
  { name: "Monday", label: "Monday" },
  { name: "Tuesday", label: "Tuesday" },
  { name: "Wednesday", label: "Wednesday" },
  { name: "Thursday", label: "Thursday" },
  { name: "Friday", label: "Friday" },
  { name: "Saturday", label: "Saturday" },
];

const format = "h:mm a";
const { Option } = Select;

const AddAvailability = ({ section, api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [availableWorkingDays, setAvailableWorkingDays] = useState(weekdays);

  useEffect(() => {
    console.log("working Modal?>>>>>>>>>>>>.");
    if (!data) return;
    const updatedAvailability = data?.availability?.map((item, index) => {
      const updatedTimeSlots = [
        item.availability_time_from,
        item.availability_time_to,
      ];
      console.log(updatedTimeSlots, "updatedTimeSlots>>>>>>>>>>>>");
      return [
        {
          time_slots: [updatedTimeSlots],
          day: item.availability_day,
        },
      ];
    });

    console.log(updatedAvailability, 13666);

    form.setFieldsValue({
      ...data,
      availability: updatedAvailability,
    });
  }, [data]);

  const onCreate = (values) => {
    setLoading(true);
    console.log(values, "jennrcuc icrju");
    const payload = {
      ...values,
    };
    // return console.log(values, 200);

    request({
      url: `${api.doctor + `/add-availability/${data}`}`,
      method: "POST",
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
  const [selectedMonth, setSelectedMonth] = useState("");

  return (
    <Modal
      open={show}
      width={750}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form
        id="create"
        form={form}
        onFinish={onCreate}
        layout="vertical"
        initialValues={{
          dob: moment("1990-01-01", "DD-MM-YYYY"),
        }}
      >
        <div className="add_user_title">
          <h4 className="modal_title_cls">{`${"Add " + "Availability"}`}</h4>
        </div>

        <Row gutter={24}>
          <Col span={24} md={24}>
            <Form.List name="availability" className="mt-2" initialValue={[{}]}>
              {(fields1, { add, remove }, { form }) => (
                <>
                  {fields1.map((field_fr_1, index_fr_1) => (
                    <div key={field_fr_1.key}>
                      <Space
                        key={field_fr_1.key}
                        align="baseline"
                        className="gap-cls"
                      >
                        <Row gutter={24}>
                          <Col sm={12}>
                            <Form.Item
                              label="Select Day"
                              name={[field_fr_1.name, "day"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Please select the day!",
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Working Day"
                                onChange={(value) => {
                                  setSelectedMonth(value); // Correctly updates selected day
                                }}
                              >
                                {console.log(
                                  availableWorkingDays,
                                  "daysss>>>>>>.",
                                )}
                                {availableWorkingDays.map((day) => (
                                  <Select.Option
                                    value={day.name}
                                    key={day.name}
                                  >
                                    {day.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col sm={12}>
                            <Form.List
                              name={[field_fr_1.name, "time_slots"]}
                              initialValue={[""]}
                              rules={[
                                {
                                  validator: async (_, timeSlots) => {
                                    if (!timeSlots || timeSlots.length === 0) {
                                      return Promise.reject(
                                        new Error(
                                          "Please add at least one time slot!",
                                        ),
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              {(
                                fields,
                                { add: addTime, remove: removeTime },
                                { form },
                              ) => (
                                <div>
                                  {fields.map((field_fr, index_fr) => (
                                    <div key={field_fr.key}>
                                      <Row>
                                        <Col span={20} sm={20}>
                                          <Form.Item
                                            className="qty-cls "
                                            {...field_fr}
                                            style={{ minWidth: "180px" }}
                                            name={[field_fr.name]}
                                            label="Enter Time Range"
                                            rules={[
                                              {
                                                required: true,
                                                message:
                                                  "Please select the time range!",
                                              },
                                            ]}
                                          >
                                            <TimePicker.RangePicker
                                              format="h:mm a"
                                              minuteStep={30}
                                              use12Hours
                                              showNow={false} // Prevents showing the default "Now" button
                                              onOpenChange={(open) => {
                                                if (open) {
                                                  const nextAvailableTime =
                                                    moment()
                                                      .add(1, "minutes")
                                                      .startOf("minute");
                                                  console.log(
                                                    "Next Available Time:",
                                                    nextAvailableTime.format(
                                                      "h:mm a",
                                                    ),
                                                  );
                                                }
                                              }}
                                              disabledTime={() => {
                                                const selectedDay =
                                                  selectedMonth;
                                                const todayName =
                                                  moment().format("dddd");
                                                const currentHour =
                                                  moment().hour();
                                                const currentMinute =
                                                  moment().minute();

                                                if (selectedDay === todayName) {
                                                  return {
                                                    disabledHours: () => [
                                                      ...Array(
                                                        currentHour,
                                                      ).keys(),
                                                    ], // Disable past hours
                                                    disabledMinutes: (
                                                      selectedHour,
                                                    ) => {
                                                      if (
                                                        selectedHour ===
                                                          undefined ||
                                                        selectedHour === -1
                                                      ) {
                                                        return [
                                                          ...Array(60).keys(),
                                                        ]; // Disable all minutes if no hour is selected
                                                      }
                                                      if (
                                                        selectedHour ===
                                                        currentHour
                                                      ) {
                                                        return [
                                                          ...Array(
                                                            currentMinute + 1,
                                                          ).keys(),
                                                        ]; // Disable past minutes
                                                      }
                                                      return [];
                                                    },
                                                  };
                                                }

                                                return {};
                                              }}
                                              onSelect={(time) => {
                                                if (!time) return;
                                                const selectedHour =
                                                  time.hour();
                                                const selectedMinute =
                                                  time.minute();

                                                // Fix: Ensure a valid selection is made when switching to PM
                                                if (
                                                  selectedHour === 12 &&
                                                  selectedMinute === 0
                                                ) {
                                                  const nextTime = moment()
                                                    .add(1, "hour")
                                                    .startOf("hour");
                                                  console.log(
                                                    "Fixing Default PM Selection:",
                                                    nextTime.format("h:mm a"),
                                                  );
                                                }
                                              }}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col span={4} sm={4}>
                                          <div className="addDelete_option">
                                            {index_fr > 0 ? (
                                              <div
                                                className="minus-wrap"
                                                style={{ marginTop: "34px" }}
                                              >
                                                <div
                                                  className="delete_icon_cls"
                                                  onClick={() =>
                                                    removeTime(field_fr.name)
                                                  }
                                                  style={{
                                                    borderRadius: "50%",
                                                    color: "#000",
                                                  }}
                                                >
                                                  <img src={DeleteIcon} />
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  ))}
                                  <Form.Item
                                    className="mb-2"
                                    style={{ marginTop: "1px", width: "20px" }}
                                  >
                                    <Button
                                      onClick={() => addTime()}
                                      block
                                      className="primary_btn btnStyle add-item-btn"
                                    >
                                      <i class="fas fa-plus" />
                                    </Button>
                                  </Form.Item>
                                </div>
                              )}
                            </Form.List>
                          </Col>

                          <Col span={12} sm={2}>
                            <div
                              className="addDelete_option"
                              style={{ marginTop: "30px" }}
                            >
                              {index_fr_1 > 0 ? (
                                <div className="minus-wrap delete-wrep mb-3">
                                  <div
                                    className="delete_icon_cls"
                                    onClick={() => remove(field_fr_1.name)}
                                    style={{
                                      borderRadius: "50%",
                                      color: "#000",
                                    }}
                                  >
                                    <img src={DeleteIcon} />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  ))}
                  <Col md={8}>
                    <Form.Item style={{ marginTop: "0px" }}>
                      <Button
                        onClick={() => add()}
                        block
                        className="primary_btn btnStyle add-item-btn"
                      >
                        <i class="fas fa-plus" />
                        Add Another Day
                      </Button>
                    </Form.Item>
                  </Col>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAvailability;
