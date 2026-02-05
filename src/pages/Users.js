import { useEffect, useState } from "react";
import API from "../services/api";
import { Skeleton, Button, Table, Input, Select, Card, Space } from "antd";
import { toast } from "react-toastify";

function Users() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const loadUsers = async () => {
    try {
      const res = await API.get("/users/");
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await API.get("/users/me");
        setMe(meRes.data);
        await loadUsers();
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addUser = async () => {
    if (!username || !password) {
      toast.warning("Enter username and password");
      return;
    }

    try {
      await API.post("/users/add", { username, password, role });
      toast.success("User created successfully");
      setUsername("");
      setPassword("");
      setRole("user");
      loadUsers();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const deleteUser = async (uname) => {
    try {
      await API.delete(`/users/delete/${uname}`);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  if (loading) return <Skeleton active />;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Account Management</h2>

      <Card style={{ marginBottom: "20px" }}>
        <p><b>Username:</b> {me.username}</p>
        <p><b>Role:</b> {me.role}</p>
      </Card>

      {me.role === "admin" && (
        <>
          <Card title="Add New User" style={{ marginBottom: "20px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <Input.Password
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Select value={role} onChange={setRole} style={{ width: "100%" }}>
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
              <Button type="primary" onClick={addUser} block>
                Create User
              </Button>
            </Space>
          </Card>

          <Card title="Existing Users">
            <Table
              columns={[
                { title: 'Username', dataIndex: 'username', key: 'username' },
                { title: 'Role', dataIndex: 'role', key: 'role' },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (text, record) => (
                    record.username !== me.username ? (
                      <Button danger onClick={() => deleteUser(record.username)}>
                        Delete
                      </Button>
                    ) : (
                      <span>—</span>
                    )
                  ),
                },
              ]}
              dataSource={users}
              rowKey="username"
              pagination={false}
              bordered
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default Users;
