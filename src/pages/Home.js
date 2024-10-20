import { useEffect, useState } from "react";

import { Card, Col, Row, Typography } from "antd";
import axios from "axios";
import {
  UserSwitchOutlined,
  DollarOutlined,
  BellOutlined,
} from "@ant-design/icons";

function Home() {
  const { Title } = Typography;
  const [counts, setCounts] = useState([]);

  const getIcon = (key) => {
    switch (key) {
      case "users":
        return <UserSwitchOutlined />;
      case "payments":
        return <DollarOutlined />;
      case "notification":
        return <BellOutlined />;
      case "suppliers":
        return <UserSwitchOutlined />;
      default:
        return <UserSwitchOutlined />; // Fallback for unmatched keys
    }
  };

  useEffect(() => {
    // Fetch the data and convert it to an array of {key, value} objects
    const fetchData = async () => {
      try {
        // Fetch data for the specific ID
        const response = await axios.get(
          `https://6635c6cd415f4e1a5e25517c.mockapi.io/dashboard/1`
        );
        const data = response.data;

        // Convert object to an array of {key, value}
        const dataArray = Object.entries(data).map(([key, value]) => {
          return {
            key,
            value,
            icon: getIcon(key), // default to Info icon if key is not mapped
          };
        });

        console.log(dataArray);
        setCounts(dataArray); // Set record to be used
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="layout-content">
        <Row className="rowgap-vbox" gutter={[24, 0]}>
          {counts.map((c, index) => (
            <Col
              key={index}
              xs={24}
              sm={24}
              md={12}
              lg={6}
              xl={6}
              className="mb-24"
            >
              <Card bordered={false} className="criclebox ">
                <div className="number">
                  <Row align="middle" gutter={[24, 0]}>
                    <Col xs={18}>
                      <span>{c.key}</span>
                      <Title level={3}>{`$${c.value}`}</Title>
                    </Col>
                    <Col xs={6}>
                      <div className="icon-box">{c.icon}</div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Home;
