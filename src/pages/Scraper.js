import { useEffect, useState } from "react";
import API from "../services/api";
import { Skeleton, Progress, Button, Table, Select, Card, Space } from "antd";
import { toast } from "react-toastify";

function Scraper() {
  const [regions, setRegions] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [region, setRegion] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("All");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);

  /* LOAD REGIONS */
  useEffect(() => {
    API.get("/locations/regions")
      .then(res => setRegions(res.data))
      .catch(() => toast.error("Failed to load regions"));
  }, []);

  /* REGION → STATES */
  const onRegionChange = async (r) => {
    setRegion(r);
    setState("");
    setCity("");
    setStates([]);
    setDistricts([]);

    const res = await API.get(`/locations/states?region=${r}`);
    setStates(res.data);
  };

  /* STATE → DISTRICTS */
  const onStateChange = async (s) => {
    setState(s);
    setCity("");
    const res = await API.get(
      `/locations/districts?region=${region}&state=${s}`
    );
    setDistricts(res.data);
  };

  /* RUN EXTRACTION */
  const runExtraction = async () => {
    if (!region || !state || !city) {
      toast.warning("Select Region, State and District");
      return;
    }

    setLoading(true);
    setData([]);
    setProgress(null);
    setJobId(null);

    try {
      const res = await API.post("/extract/run", {}, {
        params: { region, state, city, college_type: type }
      });

      setJobId(res.data.job_id);
      toast.success("Extraction started");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to start extraction");
    }
  };

  /* POLL JOB */
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/extract/status/${jobId}`);
        setProgress(res.data);

        if (res.data.status === "completed") {
          clearInterval(interval);
          setLoading(false);

          const dataRes = await API.get("/colleges", {
            params: { state, city, type }
          });

          setData(dataRes.data || []);
          toast.success("Extraction completed successfully!");
        }
      } catch (error) {
        clearInterval(interval);
        setLoading(false);
        toast.error("Error during extraction");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, state, city, type]);

  /* EXPORT */
  const exportExcel = async () => {
    if (data.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      const res = await API.post("/extract/export", data, {
        responseType: "blob"
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "extracted_colleges.xlsx";
      a.click();

      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Data Extraction</h2>

      <Card style={{ marginBottom: "20px" }}>
        <Space wrap style={{ justifyContent: "center" }}>
          <Select
            placeholder="Select Region"
            value={region}
            onChange={onRegionChange}
            style={{ width: 150 }}
          >
            {regions.map(r => (
              <Select.Option key={r} value={r}>{r}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Select State"
            value={state}
            onChange={onStateChange}
            style={{ width: 150 }}
            disabled={!region}
          >
            {states.map(s => (
              <Select.Option key={s} value={s}>{s}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Select District"
            value={city}
            onChange={setCity}
            style={{ width: 150 }}
            disabled={!state}
          >
            {districts.map(d => (
              <Select.Option key={d} value={d}>{d}</Select.Option>
            ))}
          </Select>

          <Select value={type} onChange={setType} style={{ width: 150 }}>
            <Select.Option value="All">All</Select.Option>
            <Select.Option value="Engineering">Engineering</Select.Option>
            <Select.Option value="Management">Management</Select.Option>
          </Select>
        </Space>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <Space>
            <Button type="primary" onClick={runExtraction} loading={loading}>
              Run Data Extraction
            </Button>
            <Button onClick={exportExcel} disabled={data.length === 0}>
              Export to Excel
            </Button>
          </Space>
        </div>
      </Card>

      {loading && (
        <Card style={{ marginBottom: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <p>🔄 Extraction running…</p>
          </div>
        </Card>
      )}

      {progress && (
        <Card style={{ marginBottom: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <Progress
              percent={
                progress.total_found
                  ? Math.round((progress.processed / progress.total_found) * 100)
                  : 0
              }
              status="active"
            />
            <p>
              Found: {progress.total_found} | Processed: {progress.processed} |
              Inserted: {progress.inserted}
            </p>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <Skeleton active />
        ) : (
          <Table
            columns={[
              { title: "College", dataIndex: "college_name", key: "college_name" },
              { title: "Email", dataIndex: "email", key: "email" },
              { title: "Mobile", dataIndex: "mobile", key: "mobile" },
              { title: "District", dataIndex: "city", key: "city" },
              { title: "State", dataIndex: "state", key: "state" },
              { title: "Type", dataIndex: "type", key: "type" }
            ]}
            dataSource={data}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
}

export default Scraper;
