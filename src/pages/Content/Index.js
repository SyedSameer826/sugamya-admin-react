import { Row, Col, Card, Table, Button, Input, Tag, Tooltip } from "antd";
import React, { useState, useEffect, useContext } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import ConfirmationBox from "../../components/ConfirmationBox";
import moment from 'moment';
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";

import { Link } from "react-router-dom";


const Search = Input.Search;

function Content() {
  const heading = lang("Content");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Content";
  const routeName = "content";

  const api = {
    content: apiPath.content,
  }

  const [searchText, setSearchText] = useState('');
  const { request } = useRequest()
  const { showConfirm } = ConfirmationBox()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
    //For Filters
    const [filter, setFilter] = useState();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();
  const activity = (id) => {
    navigate(`/user/activity/${id}`);
  };
  const view = (slug) => {
    navigate(`/${routeName}/view/${slug}`)
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return (name ? <span className="cap">{name}</span> : '-');
      },
    },
    {
      title: "Created On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return (
          moment(created_at).format('DD-MM-YYYY')
        );
      },
    },
    {
      title: "Action",
      fixed: 'right', 
      render: (_, record) => {
        return (
          <>
            <Tooltip title={"Update " + sectionName} color={"purple"} key={"update" + routeName}>
              <Link className="edit-cl btnStyle primary_btn" to={`/${routeName}/update/` + (record ? record.slug : null)}><i class="fas fa-edit"></i></Link>
              </Tooltip>
            <Tooltip title={"View " + sectionName} color={"purple"} key={"view" + routeName}>
              <Button className=" btnStyle primary_btn" onClick={() => { view(record.slug) }}><i class="fas fa-light fa-eye"></i></Button>
              </Tooltip>
{/* 
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
            </Tooltip> */}

          </>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true)
    fetchData(pagination, filter)
  }, [refresh, debouncedSearchText])


  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null

    request({
      url: api.content + `?status=${filterActive ? filterActive.join(',') : ''}&page=${pagination ? pagination.current : 1}&limit=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}`,
      method: 'GET',
      onSuccess: (data) => {
        setLoading(false)
        setList(data?.data)
        setPagination(prev => ({ current: pagination?.current, total: data?.data?.length }))
      },
      onError: (error) => {
        setLoading(false)
        ShowToast(error, Severty.ERROR)
      }
    })
  }

  const handleChange = (pagination, filters) => {
    setFilter(filters)
    fetchData(pagination, filters);
  }

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={sectionName + " Management"}
              extra={
                <>
                  {/* <Search
                    allowClear
                    size="large"
                    onChange={onSearch}
                    value={searchText}
                    onPressEnter={onSearch}
                    placeholder="Search By name"
                  /> */}
                </>
              }
            >
              <div className="table-responsive customPagination">
              <h4 className="text-right">Total Records: {pagination.total ? pagination.total : list.length}</h4>

                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                  pagination={{ defaultPageSize: 10, responsive: true, total: pagination.total, showSizeChanger: true, pageSizeOptions: ['10', '20', '30', '50'] }}
                  onChange={handleChange}
                  className="ant-border-space"
                />
              </div>

            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Content;
