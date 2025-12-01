import { Button, Input, Select, Table, Tag, Tooltip, Col } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { UndoOutlined } from "@ant-design/icons";
import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { rolesOptions } from "../../constants/var";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";
import * as XLSX from "xlsx";

import moment from "moment";
import ConfirmationBox from "../../components/ConfirmationBox";
import { useNavigate } from "react-router";
import AddCategory from "./AddCategory";

function Index() {
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Ailment";
  const routeName = "ailment";

  const api = {
    ailment: apiPath.ailment,
    category: apiPath.ailmentCategory,
  };

  const [searchText, setSearchText] = useState("");
  const [searchText2, setSearchText2] = useState("");
  const { request } = useRequest();
  const { showConfirm } = ConfirmationBox();
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [activeCount, setActiveCount] = useState();
  const [inactiveCount, setInactiveCount] = useState();
  const [cateList, setCateList] = useState([]);
  const [selected, setSelected] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showDeleteeAilment, setShowDeleteeAilment] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [pagination2, setPagination2] = useState({ current: 1, pageSize: 10 });
  const [selectedCate, setSelectedCate] = useState();
  //For Filters
  const [filter, setFilter] = useState();
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 300);
  const debouncedSearchText2 = useDebounce(searchText2, 300);
  const { Option } = Select;

  const navigate = useNavigate();

  const view = (id) => {
    navigate(`/ailment/view/${id}`);
  };

  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };
  console.log("check catalst", cateList);
  const columns = [
    {
      title: "S. No",
      dataIndex: "index",
      key: "index",
      render: (value, item, index) =>
        `${
          pagination2.current === 1
            ? index + 1
            : (pagination2.current - 1) * 10 + (index + 1)
        }`,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name;
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
      render: (_, record) => {
        return (
          <>
            <Tooltip title={"Edit"} color={"purple"} key={"update" + routeName}>
              <Button
                title="Edit"
                className="edit-cl primary_btn"
                onClick={() => {
                  setSelected(record);
                  setVisible(true);
                }}
              >
                <i class="fas fa-edit"></i>
                {/* <span>Edit</span> */}
              </Button>
            </Tooltip>

            {/* <Tooltip
              title={"Activity Log"}
              color={"purple"}
              key={"activity user"}
            >
              <Button
                className="btnStyle primary_btn"
                onClick={(e) => activity(record._id)}
              >
                <i className="fas fa-light fa-history"></i>
              </Button>
            </Tooltip>

            <Tooltip title={"View Details"} color={"purple"} key={"Delete"}>
              <Button
                title=""
                className="btnStyle primary_btn"
                onClick={() => view(record._id)}
              >
                <i class="fa fa-light fa-eye" style={{ fontSize: "14px" }}></i>
              </Button>
            </Tooltip> */}

            <Tooltip
              title={"Delete"}
              color={"purple"}
              key={"delete" + routeName}
            >
              <Button
                className="delete-cls ail"
                title="Delete"
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
        );
      },
    },
  ];

  const columns2 = [
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
      title: "Category Name",
      dataIndex: "category_id",
      key: "category_id",
      render: (_, { category_id }) => {
        return category_id ? category_id?.name : "-";
      },
    },
    {
      title: "Ailment Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name;
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
      render: (_, { is_active, _id }) => {
        let color = is_active ? "green" : "red";
        return (
          <a>
            <Tag
              onClick={(e) =>
                showConfirm({
                  record: _id,
                  path: api.ailment + "/status",
                  onLoading: () => setLoading(true),
                  onSuccess: () => setRefresh((prev) => !prev),
                })
              }
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
      title: "Created On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MM-YYYY")

      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title={"Edit"} color={"purple"} key={"update" + routeName}>
              <Button
                title="Edit"
                className="edit-cl primary_btn"
                onClick={() => {
                  setSelected(record);
                  setVisible2(true);
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
                onClick={(e) => activity(record._id)}
              >
                <i className="fas fa-light fa-history"></i>
              </Button>
            </Tooltip>

            <Tooltip
              title={"Delete"}
              color={"purple"}
              key={"delete" + routeName}
            >
              <Button
                className="delete-cls"
                title="Delete"
                onClick={() => {
                  setSelected(record);
                  setShowDeleteeAilment(true);
                }}
              >
                <i class="fa fa-light fa-trash"></i>
                {/* <span>Delete</span> */}
              </Button>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const handleExport = () => {
    const data =
      list &&
      list.length > 0 &&
      list.map((row, index) => ({
        "S.No.": index + 1,
        "Category Name": row?.category_id?.name,
        "Ailment Name": row.name,
        Status: row.is_active ? "Active" : "Inactive",
       "Registered On": row?.created_at 
          ? moment(row.created_at).format("DD-MM-YYYY") 
          : "-",
      }));
      // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ailment Data");
    XLSX.writeFile(
      workbook,
      `${
        moment().milliseconds() +
        1000 * (moment().seconds() + 60 * 60) +
        "-ailment"
      }.xlsx`,
    );
  };

  const getExportData = async (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    try {
      setExportLoading(true);
      request({
        url:
        api.ailment +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
         1
        }&pageSize=${
          pagination && pagination.toal ? pagination.toal : 10
        }&search=${debouncedSearchText2 ? debouncedSearchText2 : ""}&category=${
          selectedCate ? selectedCate : ""
        }`,
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
      "Category Name": row?.category_id?.name,
      "Ailment Name": row.name,
      Status: row.is_active ? "Active" : "Inactive",
      "Created On": moment(row.created_at).format("DD-MM-YYYY"),
    }));
    // alert(row.languageId.name)

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ailment Data");
    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY")}_Ailment.xlsx`
    );
  };

  const onDelete = (id) => {
    request({
      url: api.category + "/" + id,
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
  const onDeleted = (id) => {
    request({
      url: api.ailment + "/" + id,
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

  const fetchCtg = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.category +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination.current : 1
        }&pageSize=${
          pagination && pagination.pageSize ? pagination.pageSize : 10
        }&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);

        setCategories(data.docs);
        console.log("check data of ailment", data.docs);
        console.log(total, "total");

        setPagination2((prev) => ({
          ...prev,
          current: pagination?.current,
          total: data.totalDocs,
        }));
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

    request({
      url:
        api.ailment +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${
          pagination ? pagination?.current : 1
        }&pageSize=${
          pagination && pagination.pageSize ? pagination.pageSize : 10
        }&search=${debouncedSearchText2 ? debouncedSearchText2 : ""}&category=${
          selectedCate ? selectedCate : ""
        }`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading2(false);

        setList(data.docs);
        setInactiveCount(data.inactiveCount);
        setActiveCount(data.activeCount);
        console.log(total, "total");
        setPagination((prev) => ({
          ...prev,
          current: pagination.current,
          total: data.totalDocs,
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
    fetchCtg(pagination, filters);
  };

  const handleChange2 = (pagination, filters) => {
    setFilter(filters);
    fetchData(pagination, filters);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(pagination, filter);
    fetchCtg(pagination2);
  }, [refresh, debouncedSearchText, debouncedSearchText2, selectedCate]);

  useEffect(() => {
    setPageHeading("Ailment");
  }, []);

  const fetchCategories = () => {
    request({
      url: api.ailment + "/category-listing",
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
  useEffect(() => {
    fetchCategories();
  }, [refresh]);
  const handleChangeCategory = (selectedValues) => {
    setSelectedCate(selectedValues);
  };

  const handleReset = () => {
    setSelectedCate(null);
    setSearchText("");
    setSearchText2("");
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Ailment Category") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch">
                <Input.Search
                  className="searchInput"
                  placeholder="Search by Category Name"
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  value={searchText}
                />
              </div>
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
                Add Category
              </Button>
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
          <Table
            loading={loading}
            columns={columns}
            dataSource={categories}
            pagination={pagination2}
            onChange={handleChange}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      <SectionWrapper
        cardHeading={lang("Ailment") + " " + lang("list")}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch d-flex gap-2">
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

                <Input.Search
                  className="searchInput"
                  placeholder="Search by Ailment Name"
                  onChange={(e) => setSearchText2(e.target.value)}
                  allowClear
                  value={searchText2}
                />
                <Button
                  className="btnStyle  primary_btn"
                  onClick={() => handleReset()}
                >
                  Reset
                </Button>

                <Button
                  className="primary_btn btnStyle"
                  onClick={(e) => {
                    setVisible2(true);
                    setSearchText2("");
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
            </div>
          </>
        }
      >
        <div className="table-responsive customPagination">
          <h4 className="text-right">
            {activeCount + " Available - " + inactiveCount + " Unavailable"}
          </h4>
          <Table
            loading={loading2}
            columns={columns2}
            dataSource={list}
            pagination={pagination}
            onChange={handleChange2}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddCategory
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          selected={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {visible2 && (
        <AddForm
          section={sectionName}
          api={api}
          show={visible2}
          hide={() => {
            setSelected();
            setVisible2(false);
          }}
          selected={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={"Delete Ailment Category"}
          subtitle={`Are you sure you want to Delete this ailment category?`}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
      {showDeleteeAilment && (
        <DeleteModal
          title={"Delete Ailment"}
          subtitle={`Are you sure you want to Delete this ailment?`}
          show={showDeleteeAilment}
          hide={() => {
            setShowDeleteeAilment(false);
            setSelected();
          }}
          onOk={() => onDeleted(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
