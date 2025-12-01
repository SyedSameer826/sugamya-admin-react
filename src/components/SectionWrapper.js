import { Card, Col, Row } from "antd";
import ArrowRight from "../assets/images/arrow_left.svg";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const SectionWrapper = ({
  cardHeading,
  cardSubheading,
  extra,
  children,
  showBack = false,
}) => {
  const navigate = useNavigate();
  return (
    <div className="tabled categoryService">
      <Row gutter={[24, 0]}>
        <Col xs={24} xl={24}>
          <Card
            bordered={false}
            className="cap criclebox tablespace mb-24"
            title={
              <>
                {showBack && (
                  <div
                    style={{ cursor: "pointer" }}
                    className="arrow-ic"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeftOutlined />
                  </div>
                )}
                <div className="title-left">
                  <h4>{cardHeading}</h4>
                  {!!cardSubheading && <p>{cardSubheading}</p>}
                </div>
              </>
            }
            extra={extra}
          >
            {children}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SectionWrapper;
