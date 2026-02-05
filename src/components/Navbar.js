import { Link, useNavigate } from "react-router-dom";
import { Button, Space, Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined, HomeOutlined, DatabaseOutlined, UserSwitchOutlined, SettingOutlined } from "@ant-design/icons";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div><strong>{user?.username || 'User'}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>Role: {user?.role}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <nav style={{
      padding: "15px 20px",
      borderBottom: "1px solid #f0f0f0",
      backgroundColor: "var(--card-bg)",
      color: "var(--text-color)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "background-color 0.3s ease, color 0.3s ease"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary-color)" }}>
          College Scraper
        </div>

        <Space size="large">
          <Link to="/scraper" style={{ textDecoration: 'none' }}>
            <Button type="text" icon={<HomeOutlined />}>
              Scraper
            </Button>
          </Link>

          <Link to="/database" style={{ textDecoration: 'none' }}>
            <Button type="text" icon={<DatabaseOutlined />}>
              Database
            </Button>
          </Link>

          {user?.role === "admin" && (
            <Link to="/users" style={{ textDecoration: 'none' }}>
              <Button type="text" icon={<UserSwitchOutlined />}>
                Users
              </Button>
            </Link>
          )}

          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <Button type="text" icon={<SettingOutlined />}>
              Settings
            </Button>
          </Link>
        </Space>

        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" style={{ border: 'none', padding: '4px' }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ marginLeft: '8px' }}>{user?.username || 'User'}</span>
          </Button>
        </Dropdown>
      </div>
    </nav>
  );
}

export default Navbar;
