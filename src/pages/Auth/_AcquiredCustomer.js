import { Card, Col, Row, Tabs, Typography, Radio, Skeleton } from "antd";
import React, { useEffect, useState, } from "react";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import ProgressBar from "../../components/ProgressBar";
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AcquiredCustomer = () => {

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [period, setPriod] = useState('weekly')
    const [total, setTotal] = useState(0)
    const [selectedTab, setSelectedTab] = useState('country')
    const { request } = useRequest();

    useEffect(() => {
        request({
            url: apiPath.dashboard + `/acquire-customer/${period}?type=${selectedTab}`,
            method: "GET",
            onSuccess: ({ data }) => {
                setLoading(false);
                const { total, totalCount } = data
                setData(total);
                setTotal(totalCount)
            },
            onError: (error) => {
                setLoading(false);
                ShowToast(error, Severty.ERROR);
            },
        });
    }, [period, selectedTab]);

    return (
        <Col xs={24} xl={12} className="mb-24">
            <Card bordered={false} className="criclebox h-full">
                <div className="graph-title">
                    <Title level={5}>Acquired Customers</Title>
                    <Row style={{ justifyContent: "end" }}>
                        <Radio.Group value={period} onChange={({ target: { value } }) => {
                            console.log('radio3 checked', value);
                            setPriod(value);
                        }} defaultValue="month" buttonStyle="solid">
                            <Radio.Button value="weekly">
                                Week
                            </Radio.Button>
                            <Radio.Button value="monthly">
                                Month
                            </Radio.Button>
                            <Radio.Button value="yearly">
                                Year
                            </Radio.Button>
                        </Radio.Group>
                    </Row>
                </div>
                <Tabs
                    className="main_tabs"
                    onChange={(key) => setSelectedTab(key)}
                    activeKey={selectedTab}
                    tabBarStyle={{ color: "green" }}
                >
                    <TabPane tab={<div className="tab_title"><span>{total}</span> <span>country</span></div>} key="country">
                        <div className="graph_inner_title">
                            <h3>Country</h3>
                            <h3>Customers</h3>
                        </div>
                        {loading ? [1, 2, 3].map(item => <Skeleton active key={item} />)
                            :
                            data.map((item, index) => <ProgressBar key={index} count={item.count} name={item._id.name} total={total} />)
                        }
                    </TabPane>
                    <TabPane tab={
                        <div className="tab_title"><span>{total}</span> <span>CITY</span></div>} key="city">
                        <div className="graph_inner_title">
                            <h3>Cities</h3>
                            <h3>Customers</h3>
                        </div>
                        {loading ? [1, 2, 3].map(item => <Skeleton active key={item} />)
                            :
                            data.map((item, index) => <ProgressBar key={index} count={item.count} name={item._id.name} total={total} />)
                        }
                    </TabPane>
                </Tabs>
            </Card>
        </Col>
    )
}

export default AcquiredCustomer