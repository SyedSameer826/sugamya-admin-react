import {
  Button,
  DatePicker,
  Input,
  Table,
  Tag,
  Row,
  Col,
  Select,
  Tooltip,
  message,
} from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import useApi from "../../../hooks/useApi";
import {
  calculateAge,
  calculateAgeInYearsAndMonths,
} from "../../../helper/functions";

import Plus from "../../../assets/images/plus.svg";
import ConfirmationBox from "../../../components/ConfirmationBox";
import DeleteModal from "../../../components/DeleteModal";
import SectionWrapper from "../../../components/SectionWrapper";
import apiPath from "../../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../../context/AppContext";
import lang from "../../../helper/langHelper";
import { Severty, ShowToast } from "../../../helper/toast";
import useDebounce from "../../../hooks/useDebounce";
import useRequest from "../../../hooks/useRequest";
import AddFrom from "./AddFrom";
import { useNavigate } from "react-router";
import AddAppointment from "./AddAppointment";

const { RangePicker } = DatePicker;
const { Option } = Select;

function Index() {
  const heading = lang("Patient");
  const { setPageHeading } = useContext(AppStateContext);
  const { country } = useAppContext();
  const { getState, getCity, getCountry } = useApi();

  const sectionName = "Patient";
  const routeName = "patient";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const page = urlParams.get("page");
  const pageSize = urlParams.get("pageSize");
  const search = urlParams.get("search");
  const start_date = urlParams.get("start_date");
  const end_date = urlParams.get("end_date");

  const api = {
    patient: apiPath.listPatient,
    addEdit: apiPath.listPatient,
    addAppointment: apiPath.newAppointment
  };

  const [searchText, setSearchText] = useState(search ?? "");
  const { request } = useRequest();
  const navigate = useNavigate();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();
  const [cateList, setCateList] = useState([]);
  const [visibleAppointment, setVisibleAppointment] = useState(false)
  const [cities, setCities] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [totalRecords, setTotalRecords] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [selectedOptionsCountries, setSelectedOptionsCountries] = useState();
  const [selectedState, setselectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [ailmentList, setAilmentList] = useState([]);
  const [selectedCate, setSelectedCate] = useState();
  const [exportLoading, setExportLoading] = useState(false);

  
  //For Filters
  const [filter, setFilter] = useState({
    start_date: start_date ?? undefined,
    end_date: end_date ?? undefined,
  });
  const [selectedAilment, setSelectedAilment] = useState();

  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const debouncedSearchText = useDebounce(searchText, 300);

  const onDelete = (id) => {
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

  const view = (id) => {
    navigate(`/${routeName}/view/${id}`);
  };
  const fetchCategories = () => {
    request({
      url: apiPath.ailment + "/category-listing",
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setCateList(data);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };
  const activity = (record) => {
    navigate(`/user/activity/${record?._id}`,{state : {data :  record}});
  };

  const casePaper = (record) => {
    navigate(`/case/${record?._id}`, { state: { data: record } });
  };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination.current - 1) * pagination.pageSize + (index + 1),
    },
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      filters: [
        {
          text: "A-Z",
          value: 1,
        },
        {
          text: "Z-A",
          value: -1,
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, { uhid, _id }) => {
        return uhid ? (
          <Link to={`/${routeName}/view/${_id}`}> {uhid} </Link>
        ) : (
          _id
        );
      },
    },
    {
      title: "User Id",
      dataIndex: "userId",
      key: "userId",
      filters: [
        {
          text: "A-Z",
          value: 1,
        },
        {
          text: "Z-A",
          value: -1,
        },
      ],
      filterMultiple: false,
      width: 200,
      render: (_, { userDet, _id }) => {
        return userDet ? (
          <Link to={`/user/view/${userDet._id}`}> {userDet.uhid} </Link>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Salutation",
      dataIndex: "name",
      key: "salutation",
      width: 200,
      render: (_, { salutation }) => {
        return salutation ? salutation.trim() : "-"; // If salutation exists, return it, otherwise return a placeholder
      },
      sorter: (a, b) => {
        const salutationA = (a?.salutation?.split(" ")[0] || "").toLowerCase();
        const salutationB = (b?.salutation?.split(" ")[0] || "").toLowerCase();
        return salutationA.localeCompare(salutationB);
      },
    },

    {
      title: "First Name",
      dataIndex: "name",
      key: "firstName",
      filterMultiple: false,
      width: 150,
      onFilter: (value, record) => {
        const firstName = record?.name?.split(" ")[0] || "";
        return firstName.toLowerCase().startsWith(value.toLowerCase());
      },
      sorter: (a, b) => {
        const firstNameA = (a?.name?.split(" ")[0] || "").toLowerCase();
        const firstNameB = (b?.name?.split(" ")[0] || "").toLowerCase();
        return firstNameA.localeCompare(firstNameB);
      },
      render: (text, record) => {
        const firstName = record?.name?.split(" ")[0] || "-";
        return firstName;
      },
    },
    {
      title: "Last Name",
      dataIndex: "name",
      key: "lastName",
      filterMultiple: false,
      width: 150,
      onFilter: (value, record) => {
        const [, ...lastNameParts] = (record?.name || "").split(" ");
        const lastName = lastNameParts.join(" ");
        return lastName.toLowerCase().includes(value.toLowerCase());
      },
      sorter: (a, b) => {
        const [, ...lastNamePartsA] = (a?.name || "").split(" ");
        const lastNameA = lastNamePartsA.join(" ");
        const [, ...lastNamePartsB] = (b?.name || "").split(" ");
        const lastNameB = lastNamePartsB.join(" ");
        return lastNameA.localeCompare(lastNameB);
      },
      render: (text, record) => {
        const [, ...lastNameParts] = (record?.name || "").split(" ");
        return lastNameParts.join(" ") || "-";
      },
    },

    {
      title: "Phone Number",
      render: (_, { mobile_number, country_code }) => {
        return (
          (country_code ? `+${country_code}` : "") +
          (mobile_number ? mobile_number : "")
        );
      },
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
      // filters: [
      //   {
      //     text: "A-Z",
      //     value: 1,
      //   },
      //   {
      //     text: "Z-A",
      //     value: -1,
      //   },
      // ],
      filterMultiple: false,
      render: (_, { email }) => {
        return email ? (
          <span style={{ textTransform: "lowercase" }}>{email}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Gender",
      key: "gender",
      filters: [
        {
          text: "Male",
          value: "Male",
        },
        {
          text: "Female",
          value: "Female",
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.gender === value,
      dataIndex: "gender",
    },
    {
      title: "DOB",
      key: "dob",
      dataIndex: "dob",
      render: (dob) => <span>{dob}</span>,
    },
    {
      title: "Age",
      key: "age",
      dataIndex: "age",
      render: (_, { dob }) => {
        const age = calculateAge(dob ? dob : 0);
        console.log(age, "age>>>>>>>>>>>");
        return (
          <span>
            {" "}
            {dob ? calculateAgeInYearsAndMonths(dob) : "-"}
            {/* {age
              ? age.years && age.years !== 0
                ? `${age.years} years`
                : age.months && age.months !== 0
                ? `${age.months} months`
                : age.days && age.days !== 0
                ? `${age.days} days`
                : "-"
              : "-"} */}
          </span>
        );
      },
    },
    {
      title: "Marital Status",
      key: "marital_status",
      dataIndex: "marital_status",
      filters: [
        {
          text: "Married",
          value: "Married",
        },
        {
          text: "Single",
          value: "Single",
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.marital_status === value,
      render: (marital_status) => <span>{marital_status}</span>,
    },
    {
      title: "Relationship with user",
      key: "relationship_with_user",
      dataIndex: "relationship_with_user",
      render: (relationship_with_user) => <span>{relationship_with_user}</span>,
    },
    {
      title: "Ailment Category",
      key: "categoryId",
      dataIndex: "categoryId",
      render: (_, { categoryId }) => {
        return <spna>{categoryId?.name}</spna>;
      },
    },
    {
      title: "Ailment",
      key: "ailmentId",
      dataIndex: "ailmentId",
      render: (_, { ailmentId }) => {
        return <span>{ailmentId?.map((ailment) => ailment.name + ", ")}</span>;
      },
    },
    {
      title: "Billing Postal Code ",
      key: "postal_code",
      dataIndex: "postal_code",
    },
    // {
    //   title: "Location ",
    //   key: "location",
    //   dataIndex: "location",
    //   render: (_, { location }) => {
    //     return <span className="log-width">{location}</span>;
    //   },
    // },
    {
      title: " Billing City",
      key: "city",
      dataIndex: "city",
      render: (_, { citiesDet }) => {
        return <spna>{citiesDet?.name}</spna>;
      },
    },
    {
      title: "Billing State",
      key: "state",
      dataIndex: "state",
      render: (_, { stateDet }) => {
        return <spna>{stateDet?.name}</spna>;
      },
    },
    {
      title: "Billing Country",
      key: "country",
      dataIndex: "country",
      render: (_, { countryDet }) => {
        return <spna>{countryDet?.name}</spna>;
      },
    },
    // {
    //   title: "Address",
    //   key: "address",
    //   dataIndex: "address",
    //   render: (_, { addressDet }) => {
    //     return <spna>{addressDet?.address}</spna>;
    //   },
    // },
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
      render: (_, { is_active, _id, is_deleted }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) => {
                !is_deleted
                  ? showConfirm({
                      record: _id,
                      path: api.patient + "/status",
                      onLoading: () => setLoading(true),
                      onSuccess: () => setRefresh((prev) => !prev),
                    })
                  : message.error("Delete patient does not change status");
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
    },
    {
      title: "Action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            {!record?.is_deleted ? (
              <>
                <Tooltip title={"Edit"} color={"purple"} key={"edit"}>
                  <Button
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
                  title={"Create Appointment"}
                  color={"purple"}
                  key={"appointment"}
                >
                  <Button
                    className="btnStyle primary_btn"
                    onClick={() => {
                      setSelected(record);
                      setVisibleAppointment(true)}}
                  >
                    Create Appointment
                  </Button>
                </Tooltip>
                <Tooltip
                  title={"Case Paper"}
                  color={"purple"}
                  key={"activity user"}
                >
                  <Button
                    className="btnStyle primary_btn"
                    onClick={(e) => casePaper(record)}
                  >
                    <i class="fas fa-info-circle"></i>
                  </Button>
                </Tooltip>
                {/* <Tooltip title={"Delete"} color={"purple"} key={"Delete"}>
                <Button
                  title="Delete"
                  className="btnStyle deleteDangerbtn"
                  onClick={() => {
                    setSelected(record);
                    setShowDelete(true);
                  }}
                >
                  <img src={deleteWhiteIcon} />
                  <span>Delete</span>
                </Button>
              </Tooltip> */}
              </>
            ) : (
              ""
            )}
          </div>
        );
      },
    },
  ];

  const handleChangeCountries = (selectedValues) => {
    setSelectedOptionsCountries(selectedValues);
    getState({
      countryId: selectedValues,
      stateData: (data) => {
        setStates(data);
      },
    });
  };

  const handleChangeState = (selectedValues) => {
    setselectedState(selectedValues);
    getCity({
      stateId: selectedValues,
      cityData: (data) => {
        setCities(data);
      },
    });
  };

  const handleChangeCity = (selectedValues) => {
    setSelectedCity(selectedValues);
  };
  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchData(pagination, filter);
  }, [
    refresh,
    debouncedSearchText,
    startDate,
    endDate,
    selectedCity,
    selectedState,
    selectedAilment,
    selectedCate,
    selectedOptionsCountries,
    filter,
  ]);

  useEffect(() => {
    setPageHeading(heading);
    fetchCategories();
    fetchAilment();
  }, [setPageHeading, refresh]);

  const fetchAilment = (category_id) => {
    request({
      url: apiPath.ailment + `?category=${category_id ? category_id : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setAilmentList(data.docs);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const filterGender = filters ? filters.gender : null;
    const filterMarital = filters ? filters.marital_status : null;

    const filterUhid = filters ? filters.uhid : null;
    const filterName = filters ? filters.name : null;
    const filterEmail = filters ? filters.email : null;
    const filterUserId = filters ? filters.userId : null;

    console.log(filterActive, "filterActive");
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
        urlParams.set(key, value);
      });
    }

    navigate(
      `/patient${
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
        api.patient +
        `?status=${filterActive ? filterActive.join(",") : ""}&gender=${
          filterGender ? filterGender.join(",") : ""
        }&marital_status=${filterMarital ? filterMarital.join(",") : ""}&uhid=${
          filterUhid ? filterUhid.join(",") : ""
        }&ailment=${selectedAilment ? selectedAilment : ""}&ailment_category=${
          selectedCate ? selectedCate : ""
        }&userId=${filterUserId ? filterUserId.join(",") : ""}&name=${
          filterName ? filterName.join(",") : ""
        }&email=${filterEmail ? filterEmail.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination ? pagination.pageSize : 10
        }&search=${debouncedSearchText}${path ? `&status=1` : ""}&country=${
          selectedOptionsCountries ? selectedOptionsCountries : ""
        }&state=${selectedState ? selectedState : ""}&city=${
          selectedCity ? selectedCity : ""
        }${queryString ? `&${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          setList(data.docs);
          setTotalRecords(data.totalDocs);
          setPagination((prev) => ({
            current: pagination?.current,
            pageSize: pagination?.pageSize,
            total: data?.totalDocs,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    // setFilter(filters);
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
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

  const handleReset = () => {
    setFilter({
      start_date: undefined,
      end_date: undefined,
      status: undefined,
    });
    setSelectedCity(null);
    setselectedState(null);
    setSelectedOptionsCountries(null);
    setSelectedAilment(null);
    setSelectedCate(null);
    setRefresh((prev) => !prev);
    setStartDate();
    setEndDate();
    setSearchText("");
  };
  const handleChangeCategory = (selectedValues) => {
    setSelectedCate(selectedValues);
    fetchAilment(selectedValues);
  };
  const handleChangeAilment = (selectedValues) => {
    setSelectedAilment(selectedValues);
  };

  const getExportData = async (pagination, filters) => {
    try {
      const filterActive = filters ? filters.is_active : null;
      const filterGender = filters ? filters.gender : null;
      const filterMarital = filters ? filters.marital_status : null;

      const filterUhid = filters ? filters.uhid : null;
      const filterName = filters ? filters.name : null;
      const filterEmail = filters ? filters.email : null;
      const filterUserId = filters ? filters.userId : null;

      console.log(filterActive, "filterActive");
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
          urlParams.set(key, value);
        });
      }
      setExportLoading(true);
      request({
        url:
          api.patient +
          `?status=${filterActive ? filterActive.join(",") : ""}&gender=${
            filterGender ? filterGender.join(",") : ""
          }&marital_status=${
            filterMarital ? filterMarital.join(",") : ""
          }&uhid=${filterUhid ? filterUhid.join(",") : ""}&ailment=${
            selectedAilment ? selectedAilment : ""
          }&ailment_category=${selectedCate ? selectedCate : ""}&userId=${
            filterUserId ? filterUserId.join(",") : ""
          }&name=${filterName ? filterName.join(",") : ""}&email=${
            filterEmail ? filterEmail.join(",") : ""
          }&page=${1}&pageSize=${
            pagination ? pagination.total : 10000
          }&search=${debouncedSearchText}${path ? `&status=1` : ""}&country=${
            selectedOptionsCountries ? selectedOptionsCountries : ""
          }&state=${selectedState ? selectedState : ""}&city=${
            selectedCity ? selectedCity : ""
          }${queryString ? `&${queryString}` : ""}`,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          if (status) {
            excelData(data.docs ?? []);
          }
        },
        onError: (error) => {
          console.log(error);
          setExportLoading(false);
          ShowToast(error, Severty.ERROR);
        },
      });
    } catch (err) {
      console.log(err);
      setExportLoading(false);
    }
  };

  const excelData = (exportData) => {
    if (!exportData.length) return;
    const data = exportData.map((row, index) => ({
      "S.No.": index + 1,
      UHID: row?.uhid ? row?.uhid : "-",
      "User Id": row?.userDet?.uhid ? row?.userDet?.uhid : "-",
      Salutation: row?.salutation ? row?.salutation : "-",
      "First Name": row.name?.split(" ")[0] ? row.name?.split(" ")[0] : "-",
      "Last Name": row.name?.split(" ")[1] ? row.name?.split(" ")[1] : "-",
      "Phone Number":
        row.country_code && row.mobile_number
          ? `${row.country_code}${row.mobile_number}`
          : "-",
      "Email ID": row?.email ? row?.email : "-",
      Gender: row?.gender ? row?.gender : "-",
      DOB: row?.dob ? row?.dob : "-",
      Age: (() => {
        const age = calculateAge(row.dob);
        return age
          ? `${age.years} years ${age.months} months ${age.days} days`
          : "-";
      })(),
      "Marital Status": row?.marital_status ? row?.marital_status : "-",
      "Relationship with user": row?.relationship_with_user
        ? row?.relationship_with_user
        : "-",
      "Ailment Category": row?.categoryId?.name ? row?.categoryId?.name : "-",
       "Ailment": row?.ailmentId?.length > 0
    ? row.ailmentId.map((ailment) => ailment.name).join(", ")
    : "-",
      "Billing Postal Code": row?.postal_code ? row?.postal_code : "-",
      // Location: row.location,
      "Billing City": row?.citiesDet?.name ? row?.citiesDet?.name : "-",
      "Billing State": row.stateDet?.name ? row.stateDet?.name : "-",
      "Billing Country": row.countryDet?.name ? row.countryDet?.name : "-",
      Status: row.is_active === true ? "Active" : "Inactive",
      "Register Date": row.created_at
        ? moment(row.created_at).format("DD-MM-YYYY")
        : "-",
    }));
    // alert(row.languageId.name)
    const getfilterName =  exportData?.[0]

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patient Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Patients${
        filter?.start_date
          ? `_${moment(filter?.start_date).format("DD-MM-YYYY")}`
          : ""
      }${
        filter?.end_date
          ? `-${moment(filter?.end_date).format("DD-MM-YYYY")}`
          : ""
      }${debouncedSearchText ? `_${debouncedSearchText}` : ""}${
        selectedCate ? `_${getfilterName?.categoryId?.name}` : ""
      }${
        selectedOptionsCountries ? `_${getfilterName.countryDet?.name}` : ""
      }${selectedState ? `_${getfilterName.stateDet?.name}` : ""}${
        selectedCity ? `_${getfilterName.citiesDet?.name}` : ""
      }.xlsx`
    );
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Patients") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 d-grid align-items-baseline text-head_right_cont">
              <div className="pageHeadingSearch pageHeadingbig d-flex gap-2 ">
                {/* <RangePicker
                  style={{ height: 44 }}
                  disabledDate={(current) => current.isAfter(Date.now())}
                  value={[
                    startDate ? moment(startDate) : null,
                    endDate ? moment(endDate) : null,
                  ]}
                  onChange={handleChangeDate}
                /> */}
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
                <Input.Search
                  className="searchInput"
                  placeholder="Name, Number, Email, UHID, UserId"
                  onChange={onSearch}
                  value={searchText}
                  allowClear
                />
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
                <Button
                  className="btnStyle  primary_btn"
                  loading={exportLoading}
                  onClick={() => getExportData()}
                >
                  Export
                </Button>
              </div>
              <Row className="justify-content-end gap-2">
                <Select
                  showSearch
                  className="multiselect"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Select Category"
                  // mode="multiple"
                  value={selectedCate}
                  onChange={handleChangeCategory}
                >
                  {cateList && cateList.length > 0
                    ? cateList.map((item, index) => (
                        <Option value={item._id}>{item.name}</Option>
                      ))
                    : null}
                </Select>

                <Select
                  showSearch
                  className="multiselect"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Select Ailment"
                  // mode="multiple"
                  value={selectedAilment}
                  onChange={handleChangeAilment}
                >
                  {ailmentList && ailmentList.length > 0
                    ? ailmentList.map((item, index) => (
                        <Option value={item._id}>{item.name}</Option>
                      ))
                    : null}
                </Select>
              </Row>
              <Row className="justify-content-end gap-2">
                <Select
                  showSearch
                  className="multiselect"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Select Country"
                  // mode="multiple"
                  value={selectedOptionsCountries}
                  onChange={handleChangeCountries}
                >
                  {countries && countries.length > 0
                    ? countries.map((item, index) => (
                        <Option value={item._id}>{item.name}</Option>
                      ))
                    : null}
                </Select>

                <Select
                  showSearch
                  className="multiselect"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Select State"
                  // mode="multiple"
                  value={selectedState}
                  onChange={handleChangeState}
                >
                  {states && states.length > 0
                    ? states.map((item, index) => (
                        <Option value={item._id}>{item.name}</Option>
                      ))
                    : null}
                </Select>

                <Select
                  showSearch
                  className="multiselect"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder="Select City"
                  // mode="multiple"
                  value={selectedCity}
                  onChange={handleChangeCity}
                >
                  {cities && cities.length > 0
                    ? cities.map((item, index) => (
                        <Option value={item._id}>{item.name}</Option>
                      ))
                    : null}
                </Select>
                <Button
                  className="btnStyle  primary_btn"
                  onClick={() => handleReset()}
                >
                  Reset
                </Button>
              </Row>
            </div>
          </>
        }
      >
        <h4 className="text-right">Total Records: {totalRecords}</h4>
        <div className="table-responsive customPagination">
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pagination?.current,
              defaultPageSize: +pageSize
                ? +pageSize
                : +pagination.pageSize ?? 10,
              responsive: true,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={handleChange}
            className="ant-border-space"
            rowClassName={(record) => {
              return record.is_deleted ? "deleted-row" : "";
            }}
          />
        </div>
      </SectionWrapper>

      {
        visibleAppointment && (
          <AddAppointment
          section={"Create Appointment"}
          api={api}
          show={visibleAppointment}
          hide={() => {
            setSelected();
            setVisibleAppointment(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
          />
        )
      }

      {visible && (
        <AddFrom
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

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
    </>
  );
}

export default Index;
