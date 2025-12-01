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
import Plus from "../../../assets/images/plus.svg";
import ConfirmationBox from "../../../components/ConfirmationBox";
import DeleteModal from "../../../components/DeleteModal";
import SectionWrapper from "../../../components/SectionWrapper";
import apiPath from "../../../constants/apiPath";
import useApi from "../../../hooks/useApi";

import { AppStateContext, useAppContext } from "../../../context/AppContext";
import lang from "../../../helper/langHelper";
import { Severty, ShowToast } from "../../../helper/toast";
import useDebounce from "../../../hooks/useDebounce";
import useRequest from "../../../hooks/useRequest";
import AddFrom from "./AddFrom";
import * as XLSX from "xlsx";

import { useNavigate } from "react-router";
import { calculateAge } from "../../../helper/functions";

const { RangePicker } = DatePicker;
const { Option } = Select;
function Index() {
  const heading = lang("User");
  const { setPageHeading } = useContext(AppStateContext);
  const { country } = useAppContext();
  const { getState, getCity, getCountry } = useApi();

  const sectionName = "User";
  const routeName = "user";
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("status");
  const page = urlParams.get("page");
  const pageSize = urlParams.get("pageSize");
  const search = urlParams.get("search");
  const start_date = urlParams.get("start_date");
  const end_date = urlParams.get("end_date");
  const api = {
    patient: apiPath.listUser,
    addEdit: apiPath.listUser,
  };

  const [searchText, setSearchText] = useState(search ?? "");
  const { request } = useRequest();
  const navigate = useNavigate();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [countries, setCountries] = useState();
  const [states, setStates] = useState();

  const [cities, setCities] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [showDelete, setShowDelete] = useState(false);
  const [selectedOptionsCountries, setSelectedOptionsCountries] = useState();
  const [selectedState, setselectedState] = useState();
  const [selectedCity, setSelectedCity] = useState();

  const [pagination, setPagination] = useState({
    current: +page ? +page : 1,
    pageSize: +pageSize ? +pageSize : 10,
  });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [totalDoc, setTotalDoc] = useState();
  const [exportLoading, setExportLoading] = useState(false);
  //For Filters
  const [filter, setFilter] = useState({
    start_date: start_date ?? undefined,
    end_date: end_date ?? undefined,
  });
  const [rowfilter, setRowFilter] = useState();

  const onDelete = (id) => {
  setLoading(true); // show page/table loader

  request({
    url: api.patient + "/" + id,
    method: "DELETE",
    onSuccess: (data) => {
      ShowToast(data.message, Severty.SUCCESS);
      setLoading(false); // hide loader after API success
      setRefresh((prev) => !prev); // refresh table
      setShowDelete(false); // close delete modal
      setSelected(); // clear selected record
    },
    onError: (error) => {
      setLoading(false); // hide loader on error
      ShowToast(error, Severty.ERROR);
    },
  });
};


  const calculateAge = (dob) => {
    console.log("dob????????????????", dob);
    if (!dob) return null;

    const today = moment();
    const birthDate = moment(dob, "DD-MM-YYYY"); // Specify the format 'DD-MM-YYYY'
    const years = today.diff(birthDate, "years");
    birthDate.add(years, "years");
    const months = today.diff(birthDate, "months");
    birthDate.add(months, "months");
    const days = today.diff(birthDate, "days");
    console.log(years, months, days);
    return { years, months, days };
  };

  // const activity = (id) => {
  //   navigate(`/user/activity/${id}`);
  //   setPageHeading("User Activity");
  // };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
      render: (_, __, index) =>
        pagination.current === 1
          ? index + 1
          : (pagination?.current - 1) * pagination?.pageSize + (index + 1),
    },
    {
      title: "User ID",
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
    // {
    //   title: "Name",
    //   dataIndex: "name",
    //   key: "name",
    //   filters: [
    //     {
    //       text: "A-Z",
    //       value: 1,
    //     },
    //     {
    //       text: "Z-A",
    //       value: -1,
    //     },
    //   ],
    //   filterMultiple: false,
    //   width: 200,
    //   render: (_, { name,firstName, lastName }) => {
    //     return name ? name : firstName ? firstName + " " + lastName : "-";
    //   },
    // },

    {
      title: "Salutation",
      key: "salutation",
      dataIndex: "salutation",
      filters: [
        { text: "Mr", value: "Mr" },
        { text: "Mrs", value: "Mrs" },
        { text: "Miss", value: "Miss" },
      ],
      onFilter: (value, record) => record.salutation === value,
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
        const phoneNumber = mobile_number
          ? `${country_code ? `+${country_code}-` : ""}${mobile_number}`
          : "-";
        return phoneNumber;
      },
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
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
      render: (_, { email }) => {
        return email ? <span>{email}</span> : "-";
      },
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: "gender",
      filters: [
        { text: "Male", value: "Male" },
        { text: "Female", value: "Female" },
      ],
      onFilter: (value, record) => record?.gender === value,
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
      dataIndex: "dob",
      render: (_, { dob }) => {
        const age = calculateAge(dob ? dob : 0);
        return (
          <span>
            {age
              ? age.years && age.years !== 0
                ? `${age.years} years`
                : age.months && age.months !== 0
                ? `${age.months} months`
                : age.days && age.days !== 0
                ? `${age.days} days`
                : "-"
              : "-"}
          </span>
        );
      },
      filters: [
        { text: "18+", value: "18" },
        { text: "25+", value: "25" },
        { text: "35+", value: "35" },
        { text: "45+", value: "45" },
        { text: "60+", value: "60" },
      ],
      onFilter: (value, record) => {
        const age = calculateAge(record.dob);
        if (!age) return false;

        switch (value) {
          case "18":
            return age.years >= 18;
          case "25":
            return age.years >= 25;
          case "35":
            return age.years >= 35;
          case "45":
            return age.years >= 45;
          case "60":
            return age.years >= 60;
          default:
            return false;
        }
      },
    },
    {
      title: "City",
      key: "city",
      dataIndex: "city",
      render: (_, { citiesDet }) => {
        return <span>{citiesDet?.name}</span>;
      },
    },
    {
      title: "State",
      key: "state",
      dataIndex: "state",
      render: (_, { stateDet }) => {
        return <span>{stateDet?.name}</span>;
      },
    },
    {
      title: "Country",
      key: "country",
      dataIndex: "country",
      render: (_, { countryDet }) => {
        return <span>{countryDet?.name}</span>;
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
      render: (_, { is_active, _id, is_delete }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) => {
                !is_delete
                  ? showConfirm({
                      record: _id,
                      path: api.patient + "/status",
                      onLoading: () => setLoading(true),
                      onSuccess: () => setRefresh((prev) => !prev),
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
      title: "Registered Date",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY");
      },
      sorter: (a, b) =>
        moment(a.created_at).unix() - moment(b.created_at).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <>
            {record?.is_delete ? (
              <>
                {" "}
                <div div className="d-flex justify-contenbt-start">
                  <Tooltip
                    title={"Devices Log"}
                    color={"purple"}
                    key={"activity user"}
                  >
                    <Button
                      className="btnStyle primary_btn"
                      onClick={(e) => navigate(`/user-devices/${record._id}`)}
                    >
                      <i className="fas fa-light fa-history"></i>
                    </Button>
                  </Tooltip>
                </div>
              </>
            ) : (
              <div div className="d-flex justify-contenbt-start">
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
                    title={"Devices Log"}
                    color={"purple"}
                    key={"activity user"}
                  >
                    <Button
                      className="btnStyle primary_btn"
                      onClick={(e) => navigate(`/user-devices/${record._id}`,{state : { data : record}})}
                    >
                      <i className="fas fa-light fa-history"></i>
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
                      <i class="fa fa-light fa-trash"></i>
                      {/* <span>Delete</span> */}
                    </Button>
                  </Tooltip>
                </>
              </div>
            )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination }, filter);
  }, [
    refresh,
    debouncedSearchText,
    startDate,
    endDate,
    selectedCity,
    selectedState,
    selectedOptionsCountries,
    filter,
  ]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    console.log("check its working or ::::::::::::");
    const filterActive = filters ? filters.is_active : null;
    const filterUhid = filters ? filters.uhid : null;
    const filterName = filters ? filters.name : null;
    const filterEmail = filters ? filters.email : null;
    const filterGender = filters ? filters.gender : null;

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
      `/user${
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
          filterGender ? filterGender : ""
        }&uhid=${filterUhid ? filterUhid.join(",") : ""}&name=${
          filterName ? filterName.join(",") : ""
        }&email=${filterEmail ? filterEmail.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination ? pagination.pageSize : 50
        }&search=${debouncedSearchText}${path ? `&status=1` : ""}&country=${
          selectedOptionsCountries ? selectedOptionsCountries : ""
        }&state=${selectedState ? selectedState : ""}&city=${
          selectedCity ? selectedCity : ""
        }${queryString ? `&${queryString}` : ""}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          console.log("check country filter", data.docs);
          setList(data.docs);
          setTotalDoc(data?.totalDocs);
          setPagination((prev) => ({
            current: pagination?.current,
            total: data?.totalDocs,
            pageSize: pagination.pageSize,
          }));

          // setPagination((prev) => ({
          //   ...prev,
          //    current: pagination?.current,
          //   total: data?.totalDocs,
          // }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    console.log(filters, "check 0000000000000000001");
    setRowFilter(filters);
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ current: 1, pageSize: pagination?.pageSize });
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
      category_id: undefined,
      city_id: undefined,
      start_date: undefined,
      end_date: undefined,
      status: undefined,
      role: undefined,
    });
    setPagination({ current: 1, pageSize: 10 });
    setSelectedCity(null);
    setselectedState(null);
    setSelectedOptionsCountries(null);
    setSearchText("");
    setStartDate();
    setEndDate();
  };
  const handleChangeCountries = (selectedValues) => {
    console.log("00000000000000000000002");
    setSelectedOptionsCountries(selectedValues);
    getState({
      countryId: selectedValues,
      stateData: (data) => {
        setStates(data);
      },
    });
  };

  const handleChangeState = (selectedValues) => {
    console.log("000000000000000000000333");
    setselectedState(selectedValues);
    getCity({
      stateId: selectedValues,
      cityData: (data) => {
        setCities(data);
      },
    });
  };

  const handleChangeCity = (selectedValues) => {
    console.log("000000000000000000444444");
    setSelectedCity(selectedValues);
  };
  useEffect(() => {
    getCountry({
      countryData: (data) => setCountries(data),
    });
  }, []);

  const getExportData = async (pagination, filters) => {
    try {
      const filterActive = filters ? filters.is_active : null;
      const filterUhid = filters ? filters.uhid : null;
      const filterName = filters ? filters.name : null;
      const filterEmail = filters ? filters.email : null;
      const filterGender = filters ? filters.gender : null;

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
            filterGender ? filterGender : ""
          }&uhid=${filterUhid ? filterUhid.join(",") : ""}&name=${
            filterName ? filterName.join(",") : ""
          }&email=${
            filterEmail ? filterEmail.join(",") : ""
          }&page=${1}&pageSize=${
            pagination ? pagination.total : 1000
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

   const data = exportData.map((row, index) => {
  const nameParts = (row?.name || "").trim().split(" ");
  const firstName = nameParts[0] || "-";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

  return {
    "S.No.": index + 1,
    "User Id": row?.uhid || "-",
    Salutation: row?.salutation || "-",
    "First Name": firstName,
    "Last Name": lastName,
    "Phone Number":
      row?.country_code && row?.mobile_number
        ? `+${row.country_code}${row.mobile_number}`
        : "-",
    "Email ID": row?.email || "-",
    Gender: row?.gender || "-",
    Dob: row?.dob || "-",
    Age: (() => {
      const age = calculateAge(row?.dob);
      return age
        ? `${age.years} years ${age.months} months ${age.days} days`
        : "-";
    })(),
    City: row?.citiesDet?.name || "-",
    State: row?.stateDet?.name || "-",
    Country: row?.countryDet?.name || "-",
    Status: row?.is_active === true ? "Active" : "Inactive",
    "Registered Date": row?.created_at
      ? moment(row.created_at).format("DD-MM-YYYY")
      : "-",
  };
});

    // alert(row.languageId.name)

    const getfilterName = exportData?.[0];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
    XLSX.writeFile(
      workbook,

      `${moment().format("DD-MM-YYYY")}_Users${
        filter?.start_date
          ? `_${moment(filter?.start_date).format("DD-MM-YYYY")}`
          : ""
      }${
        filter?.end_date
          ? `-${moment(filter?.end_date).format("DD-MM-YYYY")}`
          : ""
      }${debouncedSearchText ? `_${debouncedSearchText}` : ""}${
        selectedOptionsCountries ? `_${getfilterName.countryDet?.name}` : ""
      }${selectedState ? `_${getfilterName.stateDet?.name}` : ""}${
        selectedCity ? `_${getfilterName.citiesDet?.name}` : ""
      }.xlsx`
    );
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Users") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 d-grid align-items-baseline text-head_right_cont">
              <div className="pageHeadingSearch pageHeadingbig d-flex gap-2">
                {/* <RangePicker
                  style={{ height: 44 }}
                  value={
                    startDate && endDate
                      ? [moment(startDate), moment(endDate)]
                      : null
                  } // Use an array of moment objects
                  disabledDate={(current) =>
                    current && current.isAfter(moment())
                  } // Ensure 'current' is valid
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
                  placeholder="Name, Number, Email, UHID"
                  onChange={onSearch}
                  value={searchText}
                  allowClear
                />
                <Button
                  className="btnStyle  primary_btn"
                  loading={exportLoading}
                  onClick={() => getExportData()}
                >
                  Export
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
              <div className="pageHeadingSearch pageHeadingbig d-flex justify-content-end gap-2">
                <Select
                  showSearch
                  className="multiselect"
                  placeholder="Select Country"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
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
                  placeholder="Select State"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
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
                  placeholder="Select City"
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
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
              </div>
            </div>
          </>
        }
      >
        {" "}
        <h4 className="text-right">Total Records: {totalDoc}</h4>
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
          title={"Delete User"}
          subtitle={`Are you sure you want to Delete this user?`}
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
