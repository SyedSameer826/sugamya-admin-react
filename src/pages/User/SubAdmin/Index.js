import {
  Button,
  Modal,
  Select,
  Input,
  Form,
  Table,
  DatePicker,
  Tag,
  Tooltip,
  message,
  Upload,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import Lottie from "react-lottie";

import { UndoOutlined, UploadOutlined } from "@ant-design/icons";
import Plus from "../../../assets/images/plus.svg";
import DeleteModal from "../../../components/DeleteModal";
import SectionWrapper from "../../../components/SectionWrapper";
import apiPath from "../../../constants/apiPath";
import { rolesOptions } from "../../../constants/var";
import { AppStateContext } from "../../../context/AppContext";
import lang from "../../../helper/langHelper";
import { Severty, ShowToast } from "../../../helper/toast";
import useDebounce from "../../../hooks/useDebounce";
import useRequest from "../../../hooks/useRequest";
import AddForm from "./_AddForm";

import moment from "moment";
import * as success from "../../../assets/animation/success.json";
import ConfirmationBox from "../../../components/ConfirmationBox";
import { useNavigate, useLocation } from "react-router";
import SingleImageUpload from "../../../components/SingleImageUpload";
const { RangePicker } = DatePicker;
const DeleteSubadminReasons = [
  "Violation of Platform Policies",
  "Fraudulent Activity",
  "Chronic Violation of Terms of Service",
  "Security Concerns",
  "Inappropriate Conduct or Harassment",
];

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: success,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

function Index() {
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Sub Admin";
  const routeName = "sub-admin";
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const api = {
    subAdmin: apiPath.subAdmin,
  };
  const page = queryParams.get("page");
  const pageSize = queryParams.get("pageSize");
  const search = queryParams.get("search");
  const role = queryParams.get("role");
  const start_date = queryParams.get("start_date");
  const end_date = queryParams.get("end_date");
  const [searchText, setSearchText] = useState(search ?? "");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [email, setEmail] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [searchCity, setSearchCity] = useState("");
  const debouncedSearchCity = useDebounce(searchCity, 300);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [docs, setUploadDoc] = useState({});
  const [addDoc, setDoc] = useState(false);
  const [startDate, setStartDate] = useState(start_date ?? undefined);
  const [endDate, setEndDate] = useState(end_date ?? undefined);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState({
    country_id: undefined,
    city_id: undefined,
    year: undefined,
    month: undefined,
    start_date: start_date ?? undefined,
    end_date: end_date ?? undefined,
    role: role ?? undefined,
  });

  //For Filters
  const [tableFilter, setTableFilter] = useState();

  const navigate = useNavigate();

  const activity = (record) => {
    navigate(`/user/activity/${record?._id}`,{state : {data : record}});
  };

  const onChange = (key, value) => {
    if (key == "country_id") {
      setCities([]);
      setFilter((prev) => ({ ...prev, city_id: undefined, country_id: value }));
    } else {
      setFilter((prev) => ({ ...prev, [key]: value }));
    }
  };
  const uploadDoc = (doc, id) => {
    console.log("clicked>>>>>>");
    setUploadDoc({ doc: doc, id: id });

    setDoc(true);
  };
  const columns = [
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
      title: "Sub-Admin User",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name;
      },
    },
    {
      title: "Email",
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
      title: "Role",
      render: (_, { type }) => {
        return type ? (type === "Tele-Counsellors" ? "Support" : type)  : "-";
      },
    },
    {
      title: "Mobile Number",
      render: (_, { country_code, mobile_number }) => {
        return mobile_number ? "+" + country_code + mobile_number : "-";
      },
    },
    {
      title: "Gender",
      render: (_, { gender }) => {
        return gender ? gender : "-";
      },
    },
    {
      title: "Address",
      className: "location-wrap-7",
      render: (_, { location }) => {
        return location ? location : "-";
      },
    },
    {
      title: "Status",
      key: "is_active",
      filters: [
        {
          text: "Active",
          value: true,
        },
        {
          text: "Inactive",
          value: false,
        },
      ],
      render: (_, { is_active, _id, is_delete }, { clearFilters }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) => {
                !is_delete
                  ? showConfirm({
                      record: _id,
                      path: api.subAdmin + "/status",
                      onLoading: () => setLoading(true),
                      onSuccess: () => {
                        setRefresh((prev) => !prev);
                        clearFilters(); // Clears the applied filters
                      },
                    })
                  : message.error("Delete user does not change status");
              }}
              color={color}
              key={is_active}
            >
              {is_active ? "Active" : "Inactive"}
            </Tag>
          </a>
        );
      },
    },
    {
      title: "Register Date",
      key: "created_at",
      dataIndex: "created_at",
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
      filters: [
        {
          text: "Today",
          value: "today",
        },
        {
          text: "This Week",
          value: "this_week",
        },
        {
          text: "This Year",
          value: "this_year",
        },
        {
          text: "Next Year",
          value: "next_year",
        },
      ],
      onFilter: (value, record) => {
        const recordDate = moment(record.created_at);
        const today = moment().startOf("day");
        const thisWeekStart = moment().startOf("week");
        const thisYearStart = moment().startOf("year");
        const nextYearStart = moment().add(1, "year").startOf("year");
        const nextYearEnd = moment().add(1, "year").endOf("year");

        switch (value) {
          case "today":
            return recordDate.isSame(today, "day");
          case "this_week":
            return (
              recordDate.isSameOrAfter(thisWeekStart) &&
              recordDate.isBefore(thisWeekStart.clone().add(1, "week"))
            );
          case "this_year":
            return (
              recordDate.isSameOrAfter(thisYearStart) &&
              recordDate.isBefore(thisYearStart.clone().add(1, "year"))
            );
          case "next_year":
            return (
              recordDate.isSameOrAfter(nextYearStart) &&
              recordDate.isBefore(nextYearEnd)
            );
          default:
            return true;
        }
      },
    },
    {
      title: "Documents",
      render: (_, { document, _id, is_delete }) => {
        return (
          <div className="documents-contents">
            <div className="upload-documents-d">
              {document?.map((doc, index) =>
                doc ? (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="pdf-icons">
                      <i className="fas fa-file-pdf"></i>
                    </div>
                  </a>
                ) : null
              )}
            </div>

            {!is_delete && (
              <Button onClick={() => uploadDoc(document, _id)}>Upload</Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <div>
            {!record?.is_delete ? (
              <>
                <Tooltip
                  title={"Edit"}
                  color={"purple"}
                  key={"update" + routeName}
                >
                  <Button
                    title="Edit"
                    className="edit-cls btnStyle primary_btn"
                    onClick={() => {
                      setSelected(record);
                      setVisible(true);
                    }}
                  >
                    <i class="fas fa-edit"></i>
                    {/* <span>Edit</span> */}
                  </Button>
                </Tooltip>

                <Tooltip
                  title={"Activity Log"}
                  color={"purple"}
                  key={"activity user"}
                >
                  <Button
                    className="btnStyle primary_btn"
                    onClick={(e) => activity(record)}
                  >
                    <i className="fas fa-light fa-history"></i>
                  </Button>
                </Tooltip>
              </>
            ) : (
              ""
            )}
          </div>
        );
      },
    },
  ];

  const onUpload = () => {
    setDoc(false);
    docs?.doc?.push(inputValue);
    const payload = {
      document: docs.doc,
    };
    console.log(payload, "payload>>>>>>>>>>");

    request({
      url: `${api.subAdmin + "/" + docs.id}`,
      method: "PUT",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);

          if (selected) {
            refresh();
          } else {
            setEmail(payload.email);
          }
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

  const onDelete = (id) => {
    request({
      url: api.subAdmin + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        ShowToast(data.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChangeStatus = (id) => {
    request({
      url: api.subAdmin + "/" + id + "/status",
      method: "PUT",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        ShowToast(data.message, Severty.SUCCESS);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = (pagination, filters) => {
    console.log(filters, "filters>>>>>>>..");
    const filterActive = filters ? filters.is_active : null;
    console.log(filterActive, "filterActive>>>>>>>>>");
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        queryParams.set(key, value);
      });
    }
    navigate(
      `/sub-admin${
        queryString
          ? `?${queryString}&search=${encodeURIComponent(
              debouncedSearchText
            )}&page=${encodeURIComponent(
              pagination.current ?? 1
            )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`
          : `?search=${encodeURIComponent(
              debouncedSearchText
            )}&page=${encodeURIComponent(
              pagination.current ?? 1
            )}&pageSize=${encodeURIComponent(pagination.pageSize ?? 10)}`
      }`
    );
    request({
      url:
        api.subAdmin +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination && pagination.pageSize ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${queryString ? `&${queryString}` : ""}`,

      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);

        setList(data.docs);
        console.log(total, "total");
        setPagination((prev) => ({
          current: pagination?.current,
          total: data?.totalDocs,
          pageSize: pagination.pageSize,
        }));
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    console.log(filters, "filters>>>>>>>>>429");
    setTableFilter(filters);

    fetchData(pagination, filters);
  };
  const handleChangeDate = (e) => {
    if (e != null) {
      setStartDate(moment(e[0]._d).format("DD-MM-YYYY"));
      setEndDate(moment(e[1]._d).format("DD-MM-YYYY"));
    } else {
      setStartDate();
      setEndDate();
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchData(pagination, tableFilter);
  }, [
    refresh,
    debouncedSearchText,
    startDate,
    endDate,
    filter,
    country?.country_id,
  ]);
  const FileType = ["application/pdf"];
  useEffect(() => {
    setPageHeading("Sub-Admin");
  }, []);
  const handleReset = () => {
    setFilter({
      category_id: undefined,
      city_id: undefined,
      start_date: undefined,
      end_date: undefined,
      status: undefined,
      role: undefined,
    });
    setPagination({ current: 1, pageSize: 10 });
    setStartDate();
    setEndDate();
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Sub-Admin") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              {/* <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
                <RangePicker
                  style={{ height: 44 }}
                  disabledDate={(current) => current.isAfter(Date.now())}
                  onChange={handleChangeDate}
                  value={[
                    startDate ? moment(startDate) : null,
                    endDate ? moment(endDate) : null,
                  ]}
                />
              </div> */}
              <div className="role-wrap">
                <DatePicker.RangePicker
  format="DD-MM-YY" 
  disabledDate={(current) => current && current > moment().endOf("day")}
  placeholder={[lang("Start Date"), lang("End Date")]}
  value={[
    filter.start_date ? moment(filter.start_date, "YYYY-MM-DD") : null,
    filter.end_date ? moment(filter.end_date, "YYYY-MM-DD") : null,
  ]}

  onChange={(value) => {
    if (value && value[0] && value[1]) {
      setFilter((prev) => ({
        ...prev,
        start_date: moment(value[0]).format("YYYY-MM-DD"),
        end_date: moment(value[1]).format("YYYY-MM-DD"),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        start_date: undefined,
        end_date: undefined,
      }));
    }
  }}
/>
              </div>
              <div className="role-wrap">
                <Select
                  width="110px"
                  placeholder="Role"
                  value={filter.role}
                  filterOption={false}
                  options={rolesOptions.map((item) => ({
                    value: item.name,
                    label: item.label,
                  }))}
                  onChange={(value) => onChange("role", value)}
                />
              </div>
              {/*   <div className="role-wrap">
                <Select
                  width="110px"
                  placeholder="City"
                  showSearch
                  value={filter.city_id}
                  //  filterOption={false}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={cities.map((item) => ({
                    value: item._id,
                    label: item.name,
                  }))}
                  // onPopupScroll={handleScroll}
                  //onSearch={(newValue) => setSearchCity(newValue)}
                  onChange={(value) => onChange("city_id", value)}
                />
              </div>
 */}
              <Button
                onClick={() => handleReset()}
                type="primary"
                icon={<UndoOutlined />}
              >
                Reset
              </Button>
              <Button
                className="primary_btn btnStyle"
                onClick={(e) => {
                  setVisible(true);
                  setSearchText("");
                }}
              >
                <span className="add-Ic">
                  <img src={Plus} />
                </span>
                Add {sectionName}
              </Button>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
        <h4 className="text-right">Total Records: {pagination.total ?? 0}</h4>

          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pagination?.current,
              defaultPageSize: +pageSize ? +pageSize : +pagination.pageSize,
              responsive: true,
              total: pagination?.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={handleChange}
            className="ant-border-space"
            rowClassName={(record) => {
              return record.is_delete ? "deleted-row" : "";
            }}
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddForm
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          selected={selected}
          refresh={() => setRefresh((prev) => !prev)}
          setEmail={(data) => {
            setEmail(data);
            setShowLink(true);
          }}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={"Delete Sub Admin"}
          subtitle={`Are you sure you want to Delete this sub admin?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
          reasons={DeleteSubadminReasons}
        />
      )}

      {showStatus && (
        <DeleteModal
          title={`${selected?.is_active ? `Block` : `UnBlock`} Sub Admin`}
          subtitle={`Are you sure you want to ${
            selected?.is_active ? `block` : `unblock`
          } this sub admin?`}
          show={showStatus}
          hide={() => {
            setShowStatus(false);
            setSelected();
          }}
          onOk={() => handleChangeStatus(selected?._id)}
          reasons={[]}
        />
      )}

      {showLink && (
        <Modal
          width={750}
          open={showLink}
          onOk={() => {}}
          onCancel={() => setShowLink(false)}
          centered
          className="tab_modal deleteWarningModal"
          footer={null}
        >
          {/* <div className="success-icon">
            <img src={CheckIcon} />

          </div> */}
          <Lottie options={defaultOptions} height={120} width={120} />
          <h4 className="modal_title_cls mb-2 mt-3">{`Link Send Successfully`}</h4>
          <p className="modal_link_inner mb-0 mt-3">
            Link sent to your email address{" "}
            <span>
              {email?.slice(0, 4) + "XXXX" + email?.slice(email?.indexOf("@"))}.
            </span>
          </p>
          <p className="modal_link_inner">{`Please check email and set your password.`}</p>

          <div className="d-flex align-items-center gap-3 justify-content-center mt-5">
            <Button
              onClick={() => {
                setRefresh((prev) => !prev);
                setShowLink(false);
              }}
              className="primary_btn btnStyle "
            >
              Okay
            </Button>
          </div>
        </Modal>
      )}

      {addDoc && (
        <Modal
          title="Enter Value"
          open={addDoc}
          className="tab_modal"
          onOk={() => onUpload()}
          okButtonProps={{ className: "primary_btn btnStyle" }}
          CancelButtonProps={{ className: "primary_btn btnStyle" }}
          onCancel={() => setDoc(false)}
        >
          <Form.Item
            className=" uplod-img uplod-img-main-45-mm"
            label="Upload Degree"
            name="image"
          >
            {/* <UploadImage
              className="pdf-input"
              type={"pdf"}
              value={inputValue}
              setImage={setInputValue}
              customRequest={(event) => null}
            >
              <Button className="" icon={<UploadOutlined />}>
                Click to Upload
              </Button>
            </UploadImage> */}
            <SingleImageUpload
              fileType={FileType}
              imageType={"PDF"}
              btnName={"PDF upload"}
              onChange={(data) => setInputValue(data[0].url)}
            ></SingleImageUpload>
          </Form.Item>
        </Modal>
      )}
    </>
  );
}

export default Index;
