import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { Button, Table, Select, Card, Space, Tag, Badge, Modal } from "antd";
import { FilterOutlined, ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

function Database() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [users, setUsers] = useState([]);

  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // DELETE MODAL STATE
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // GET USER ROLE
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  // LOAD DATA WITH PAGINATION
  const loadData = useCallback(async (append = false, skip = 0) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = { skip, limit: 50 };
      if (stateFilter) params.state = stateFilter;
      if (cityFilter) params.city = cityFilter;
      if (userFilter) params.done_by = userFilter;

      const res = await API.get("/colleges", { params });
      const rows = res.data;

      if (rows.length < 50) setHasMore(false);
      else setHasMore(true);

      if (append) {
        setData(prev => [...prev, ...rows]);
      } else {
        setData(rows);
        setStates([...new Set(rows.map(r => r.state).filter(Boolean))]);
        setUsers([...new Set(rows.map(r => r.done_by).filter(Boolean))]);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [stateFilter, cityFilter, userFilter]);

  // LOAD MORE DATA
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(true, data.length);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // UPDATE CITIES WHEN STATE CHANGES
  useEffect(() => {
    if (!stateFilter) {
      setCities([]);
      setCityFilter("");
      return;
    }

    const c = data
      .filter(r => r.state === stateFilter)
      .map(r => r.city);

    setCities([...new Set(c.filter(Boolean))]);
  }, [stateFilter, data]);

  // APPLY FILTERS (RELOAD DATA)
  useEffect(() => {
    setHasMore(true);
    loadData();
  }, [loadData]);

  // CLEAR ALL FILTERS
  const clearFilters = () => {
    setStateFilter("");
    setCityFilter("");
    setUserFilter("");
    toast.info("Filters cleared");
  };

  // GET ACTIVE FILTER COUNT
  const getActiveFilterCount = () => {
    let count = 0;
    if (stateFilter) count++;
    if (cityFilter) count++;
    if (userFilter) count++;
    return count;
  };

  // DELETE FLOW
  const askDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    await API.delete(`/colleges/delete/${deleteId}`);
    setShowConfirm(false);
    setDeleteId(null);
    loadData();
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  const toggleCompleted = async (id, value) => {
    await API.put(`/colleges/completed/${id}?completed=${value}`);
    loadData();
  };

  const exportExcel = () => {
    window.open(
      "http://127.0.0.1:8000/colleges/export/excel",
      "_blank"
    );
  };

  const handleDeleteAll = async () => {
    await API.delete(`/colleges/delete-all`);
    loadData();
  };

  const updateRecord = (index, key, value) => {
    const newData = [...data];
    newData[index][key] = value;
    setData(newData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const record of data) {
        const { _id, ...updateData } = record;
        await API.put(`/colleges/update/${_id}`, updateData);
      }
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  // TABLE COLUMNS WITH PROPER WIDTHS
  const columns = [
    {
      title: 'No',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'College Name',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 250,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: text => text || "Not Mentioned",
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 150,
      render: text => text || "Not Mentioned",
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 150,
    },
    {
      title: 'District',
      dataIndex: 'city',
      key: 'city',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'Extracted By',
      dataIndex: 'done_by',
      key: 'done_by',
      width: 150,
    },
    {
      title: 'Date & Time',
      dataIndex: 'date_time',
      key: 'date_time',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.date_time || ''}
          onChange={e => updateRecord(index, 'date_time', e.target.value)}
        />
      ),
    },
    {
      title: 'Contacted By',
      dataIndex: 'contacted_by',
      key: 'contacted_by',
      width: 150,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.contacted_by || ''}
          onChange={e => updateRecord(index, 'contacted_by', e.target.value)}
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      ),
    },
    {
      title: 'Contact Method',
      dataIndex: 'contacted_method',
      key: 'contacted_method',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.contacted_method || ''}
          onChange={e => updateRecord(index, 'contacted_method', e.target.value)}
        />
      ),
    },
    {
      title: 'Response from College',
      dataIndex: 'response_from_college',
      key: 'response_from_college',
      width: 200,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.response_from_college || ''}
          onChange={e => updateRecord(index, 'response_from_college', e.target.value)}
        />
      ),
    },
    {
      title: 'TPO Name',
      dataIndex: 'tpo_name',
      key: 'tpo_name',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.tpo_name || ''}
          onChange={e => updateRecord(index, 'tpo_name', e.target.value)}
        />
      ),
    },
    {
      title: 'TPO Contact',
      dataIndex: 'tpo_contact_number',
      key: 'tpo_contact_number',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.tpo_contact_number || ''}
          onChange={e => updateRecord(index, 'tpo_contact_number', e.target.value)}
        />
      ),
    },
    {
      title: 'TPO Email',
      dataIndex: 'tpo_email',
      key: 'tpo_email',
      width: 200,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.tpo_email || ''}
          onChange={e => updateRecord(index, 'tpo_email', e.target.value)}
        />
      ),
    },
    {
      title: 'TPO Details Collected By',
      dataIndex: 'tpo_details_collected_by',
      key: 'tpo_details_collected_by',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.tpo_details_collected_by || ''}
          onChange={e => updateRecord(index, 'tpo_details_collected_by', e.target.value)}
        />
      ),
    },
    {
      title: 'Placement Officer Position',
      dataIndex: 'placement_officer_position',
      key: 'placement_officer_position',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.placement_officer_position || ''}
          onChange={e => updateRecord(index, 'placement_officer_position', e.target.value)}
        />
      ),
    },
    {
      title: 'HOD Name',
      dataIndex: 'hod_name',
      key: 'hod_name',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.hod_name || ''}
          onChange={e => updateRecord(index, 'hod_name', e.target.value)}
        />
      ),
    },
    {
      title: 'HOD Contact',
      dataIndex: 'hod_contact_number',
      key: 'hod_contact_number',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.hod_contact_number || ''}
          onChange={e => updateRecord(index, 'hod_contact_number', e.target.value)}
        />
      ),
    },
    {
      title: 'HOD Email',
      dataIndex: 'hod_email',
      key: 'hod_email',
      width: 200,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.hod_email || ''}
          onChange={e => updateRecord(index, 'hod_email', e.target.value)}
        />
      ),
    },
    {
      title: 'Call Outcome',
      dataIndex: 'call_outcome',
      key: 'call_outcome',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.call_outcome || ''}
          onChange={e => updateRecord(index, 'call_outcome', e.target.value)}
        />
      ),
    },
    {
      title: 'Schedule Called',
      dataIndex: 'schedule_called',
      key: 'schedule_called',
      width: 130,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.schedule_called || ''}
          onChange={e => updateRecord(index, 'schedule_called', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
    {
      title: 'Client Responses',
      dataIndex: 'client_responses_msg',
      key: 'client_responses_msg',
      width: 200,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.client_responses_msg || ''}
          onChange={e => updateRecord(index, 'client_responses_msg', e.target.value)}
        />
      ),
    },
    {
      title: 'Training Mode',
      dataIndex: 'training_mode',
      key: 'training_mode',
      width: 130,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.training_mode || ''}
          onChange={e => updateRecord(index, 'training_mode', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Oncampus">Oncampus</option>
        </select>
      ),
    },
    {
      title: 'Follow-up Status',
      dataIndex: 'follow_up_status',
      key: 'follow_up_status',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.follow_up_status || ''}
          onChange={e => updateRecord(index, 'follow_up_status', e.target.value)}
        />
      ),
    },
    {
      title: 'No. of Follow-ups',
      dataIndex: 'number_follow_ups',
      key: 'number_follow_ups',
      width: 130,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.number_follow_ups || ''}
          onChange={e => updateRecord(index, 'number_follow_ups', e.target.value)}
        />
      ),
    },
    {
      title: 'Proposal Shared',
      dataIndex: 'proposal_shared',
      key: 'proposal_shared',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.proposal_shared || ''}
          onChange={e => updateRecord(index, 'proposal_shared', e.target.value)}
        />
      ),
    },
    {
      title: 'Proposal Date',
      dataIndex: 'proposal_shared_date',
      key: 'proposal_shared_date',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.proposal_shared_date || ''}
          onChange={e => updateRecord(index, 'proposal_shared_date', e.target.value)}
        />
      ),
    },
    {
      title: 'MoU Required',
      dataIndex: 'mou_required',
      key: 'mou_required',
      width: 130,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.mou_required || ''}
          onChange={e => updateRecord(index, 'mou_required', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
    {
      title: 'Lead Status',
      dataIndex: 'current_lead_status',
      key: 'current_lead_status',
      width: 130,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.current_lead_status || ''}
          onChange={e => updateRecord(index, 'current_lead_status', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Done">Done</option>
          <option value="Pending">Pending</option>
          <option value="Process">Process</option>
        </select>
      ),
    },
    {
      title: 'Department Interested',
      dataIndex: 'department_interested',
      key: 'department_interested',
      width: 150,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.department_interested || ''}
          onChange={e => updateRecord(index, 'department_interested', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
    {
      title: 'Contact Date & Time',
      dataIndex: 'contact_date_time',
      key: 'contact_date_time',
      width: 180,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.contact_date_time || ''}
          onChange={e => updateRecord(index, 'contact_date_time', e.target.value)}
        />
      ),
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      width: 100,
      align: 'center',
      render: (text, record) => (
        <input
          type="checkbox"
          checked={record.completed || false}
          onChange={e =>
            toggleCompleted(record._id, e.target.checked)
          }
          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
        />
      ),
    },
    {
      title: 'College Visited',
      dataIndex: 'college_visited',
      key: 'college_visited',
      width: 130,
      render: (text, record, index) => (
        <select
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.college_visited || ''}
          onChange={e => updateRecord(index, 'college_visited', e.target.value)}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
    {
      title: 'Visited By',
      dataIndex: 'college_visited_by',
      key: 'college_visited_by',
      width: 150,
      render: (text, record, index) => (
        <input
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          value={record.college_visited_by || ''}
          onChange={e => updateRecord(index, 'college_visited_by', e.target.value)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'delete',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (text, record) => (
        <Button onClick={() => askDelete(record._id)} type="primary" danger size="small">
          Delete
        </Button>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}><p>Loading data...</p></div>;

  return (
    <div style={{ padding: "20px", maxWidth: "100%", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#1890ff", marginBottom: "5px" }}>College Database Management</h2>
        <p style={{ color: "#666", margin: "0" }}>
          Manage and filter college records • {data.length} records shown
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <Card style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={exportExcel}>
              Export Excel
            </Button>
            {isAdmin && (
              <Button danger icon={<ClearOutlined />} onClick={handleDeleteAll}>
                Delete All Records
              </Button>
            )}
            <Button type="primary" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </Space>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge count={getActiveFilterCount()} showZero={false}>
              <Tag color="blue" icon={<FilterOutlined />}>
                Active Filters
              </Tag>
            </Badge>
            {getActiveFilterCount() > 0 && (
              <Button size="small" onClick={clearFilters} icon={<ClearOutlined />}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ENHANCED FILTERS */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>Filter Records</span>
            {getActiveFilterCount() > 0 && (
              <Badge count={getActiveFilterCount()} style={{ backgroundColor: '#52c41a' }} />
            )}
          </Space>
        }
        style={{ marginBottom: "20px" }}
        extra={
          getActiveFilterCount() > 0 && (
            <Button size="small" onClick={clearFilters} icon={<ClearOutlined />}>
              Clear Filters
            </Button>
          )
        }
      >
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#666" }}>
              State
            </label>
            <Select
              placeholder="Select State"
              value={stateFilter}
              onChange={setStateFilter}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {states.map(s => (
                <Select.Option key={s} value={s}>
                  {s} ({data.filter(r => r.state === s).length})
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#666" }}>
              District
            </label>
            <Select
              placeholder="Select District"
              value={cityFilter}
              onChange={setCityFilter}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!stateFilter}
            >
              {cities.map(c => (
                <Select.Option key={c} value={c}>
                  {c} ({data.filter(r => r.city === c).length})
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#666" }}>
              Extracted By
            </label>
            <Select
              placeholder="Select User"
              value={userFilter}
              onChange={setUserFilter}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users.map(u => (
                <Select.Option key={u} value={u}>
                  {u} ({data.filter(r => r.done_by === u).length})
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* FILTER STATUS */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            {stateFilter && (
              <Tag color="blue" closable onClose={() => setStateFilter("")}>
                State: {stateFilter}
              </Tag>
            )}
            {cityFilter && (
              <Tag color="green" closable onClose={() => setCityFilter("")}>
                District: {cityFilter}
              </Tag>
            )}
            {userFilter && (
              <Tag color="orange" closable onClose={() => setUserFilter("")}>
                User: {userFilter}
              </Tag>
            )}
          </div>
        </div>

        {/* FILTER SUMMARY */}
        {getActiveFilterCount() > 0 && (
          <div style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "6px"
          }}>
            <Space>
              <SearchOutlined style={{ color: "#52c41a" }} />
              <span style={{ fontWeight: "500" }}>
                Showing {data.length} records
                {stateFilter && ` from ${stateFilter}`}
                {cityFilter && ` in ${cityFilter}`}
                {userFilter && ` extracted by ${userFilter}`}
              </span>
            </Space>
          </div>
        )}
      </Card>

      {/* TABLE */}
      <Card
        title={
          <Space>
            <span>College Records</span>
            <Tag color="geekblue">{data.length} records</Tag>
            {loadingMore && <Tag color="processing">Loading more...</Tag>}
          </Space>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={false}
            bordered
            scroll={{ x: 'max-content', y: 600 }}
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.target;
              if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore();
              }
            }}
            size="small"
            sticky
          />
        </div>
      </Card>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        title="Confirm Deletion"
        open={showConfirm}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
        confirmLoading={false}
      >
        <p>This action cannot be undone. Are you sure you want to delete this college record?</p>
      </Modal>
    </div>
  );
}

export default Database;