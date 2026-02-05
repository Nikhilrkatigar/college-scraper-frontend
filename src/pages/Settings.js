import { useState, useEffect } from "react";
import { Card, Select, Typography, Space, Divider } from "antd";
import { SettingOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Settings() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || 'light';
  });
  const [systemPreference, setSystemPreference] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme === 'system' ? systemPreference : theme);
  }, [theme, systemPreference]);

  const applyTheme = (currentTheme) => {
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
  };

  const handleThemeChange = (value) => {
    setTheme(value);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title level={2} style={{ color: "#1890ff", marginBottom: "5px" }}>
          <SettingOutlined style={{ marginRight: "10px" }} />
          Settings
        </Title>
        <Text type="secondary">Customize your application preferences</Text>
      </div>

      <Card title="Appearance" style={{ marginBottom: "20px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: "10px" }}>
              Theme
            </Text>
            <Select
              value={theme}
              onChange={handleThemeChange}
              style={{ width: "200px" }}
            >
              <Select.Option value="light">
                <Space>
                  <SunOutlined />
                  Light
                </Space>
              </Select.Option>
              <Select.Option value="dark">
                <Space>
                  <MoonOutlined />
                  Dark
                </Space>
              </Select.Option>
              <Select.Option value="system">
                <Space>
                  <SettingOutlined />
                  System ({systemPreference === 'dark' ? 'Dark' : 'Light'})
                </Space>
              </Select.Option>
            </Select>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Choose your preferred theme or follow system settings
              </Text>
            </div>
          </div>

          <Divider />

          <div>
            <Text strong>Current Theme: </Text>
            <Text type="secondary">
              {theme === 'system' ? `System (${systemPreference})` : theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
          </div>
        </Space>
      </Card>

      <Card title="About" style={{ marginBottom: "20px" }}>
        <Space direction="vertical">
          <Text>College Scraper Application</Text>
          <Text type="secondary">Version 1.0.0</Text>
          <Text type="secondary">Manage college data efficiently</Text>
        </Space>
      </Card>
    </div>
  );
}

export default Settings;