import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Radio,
  Table,
  Button,
  Avatar,
  Typography,
  Input,
  Modal,
  Form,
  message,
} from "antd";
import axios from "axios";
import debounce from "lodash.debounce"; // To debounce the search input
const { Search } = Input;

const { Title } = Typography;

function Tables() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0, // Total number of items (from API)
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal state
  const [editingRecord, setEditingRecord] = useState(null); // Record to edit
  const [form] = Form.useForm(); // Ant Design form instance

  // Fetch data from the API with pagination parameters
  const fetchData = async (page, pageSize, search = "") => {
    setLoading(true); // Set loading to true while fetching
    try {
      const response = await axios.get(
        `https://6635c6cd415f4e1a5e25517c.mockapi.io/crud`,
        {
          params: {
            page: page,
            limit: pageSize,
            search: search, // Search parameter sent to API
          },
        }
      );

      const apiData = response.data;
      const totalItems = parseInt(response.headers["x-total-count"], 10) || 50; // Fallback to 50 if the header is unavailable

      // Format the data for the table
      const formattedData = apiData.map((item) => ({
        key: item.id,
        name: (
          <Avatar.Group>
            <Avatar
              className="shape-avatar"
              shape="square"
              size={40}
              src={`https://api.dicebear.com/5.x/initials/svg?seed=${item.name}`} // Alternative avatar source
            />
            <div className="avatar-info">
              <Title level={5}>{item.name}</Title>
              <p>{item.company}</p>
            </div>
          </Avatar.Group>
        ),
        function: (
          <div className="author-info">
            <Title level={5}>{item.role}</Title>
            <p>{item.company}</p>
          </div>
        ),
        status: (
          <Button type={item.status === "ONLINE" ? "primary" : "default"}>
            {item.status === "ONLINE" ? "ONLINE" : "OFFLINE"}
          </Button>
        ),
        employed: (
          <div className="ant-employed">
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        ),
        action: (
          <div className="actions">
            <Button onClick={() => handleEditClick(item.id)}>Edit</Button>
          </div>
        ),
      }));

      setData(formattedData);
      setPagination((prev) => ({
        ...prev,
        total: totalItems, // Set the total number of items from API
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Turn off loading after data is fetched
    }
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize, searchQuery);
    setPagination(newPagination); // Update pagination state
  };

  // Debounce search input changes
  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
    fetchData(1, pagination.pageSize, value); // Reset to page 1 when searching
  }, 300);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Fetch initial data on component mount or when pagination changes
  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  // Open modal and set the record for editing
  const handleEditClick = async (id) => {
    try {
      // Fetch the data for the specific ID
      const response = await fetch(
        `https://6635c6cd415f4e1a5e25517c.mockapi.io/crud/${id}`
      );
      const data = await response.json();
      form.setFieldsValue(data); // Set record to be edited
      setEditingRecord(data); // Set record to be edited
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {    
    try {
      const values = form.getFieldsValue();
      console.log(values);
      await axios.put(
        `https://6635c6cd415f4e1a5e25517c.mockapi.io/crud/${values.id}`,
        values
      );
      message.success("Record updated successfully!");
      fetchData(pagination.current, pagination.pageSize);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating record:", error);
      message.error("Failed to update record.");
    }
  };

  // Close the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Table columns definition
  const columns = [
    {
      title: "Company",
      dataIndex: "name",
      key: "name",
      width: "32%",
    },
    {
      title: "Role",
      dataIndex: "function",
      key: "function",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "Datetime",
      key: "employed",
      dataIndex: "employed",
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];

  return (
    <div className="tabled">
      <Row gutter={[24, 0]}>
        <Col xs="24" xl={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title="Authors Table"
            extra={
              <Radio.Group defaultValue="a">
                <Radio.Button value="a">All</Radio.Button>
                <Radio.Button value="b">ONLINE</Radio.Button>
              </Radio.Group>
            }
          >
            {/* Search input */}
            <div style={{ width: "300px", padding: "20px" }}>
              <Input
                placeholder="Search by name"
                allowClear
                enterButton="Search"
                size="large"
                onChange={handleSearchChange} // Handle input changes
              />
            </div>
            <div className="table-responsive">
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                }}
                loading={loading}
                onChange={handleTableChange} // Handle pagination and sorting
              />
            </div>
          </Card>
        </Col>
      </Row>
      {/* Edit Modal */}
      <Modal
        title="Edit Record"
        visible={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Input />
          </Form.Item>
          <Form.Item label="Id" name="id">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Tables;
