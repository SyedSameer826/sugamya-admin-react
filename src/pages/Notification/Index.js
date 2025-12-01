import { Card, Col, Row, Tabs } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { AppStateContext } from "../../context/AppContext";
import { NotificationList } from "./_NotificationList";

function Index() {
  const { setPageHeading } = useContext(AppStateContext);
 
  useEffect(() => {
    setPageHeading("Notifications");
  }, []);

  return (
    <>
      <div className="tabled quoteManagement">
        
        <Row gutter={[24, 0]}>
          <Col span={24} md={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <NotificationList />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Index;
