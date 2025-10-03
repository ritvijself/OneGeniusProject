import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [agencyList, setAgencyList] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const fetchAgencyList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      const response = await fetch(
        `${apibaseurl}/api/AdminPanel/get-digital-agency-list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.isSuccess) {
        setAgencyList(result.data);
        setFilteredAgencies(result.data);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching agency list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyList();
  }, []);

  // Search
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = agencyList.filter((agency) => {
      const name = `${agency.firstName} ${agency.lastName}`.toLowerCase();
      const email = (agency.businessEmail || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
    setFilteredAgencies(filtered);
  }, [searchTerm, agencyList]);

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredAgencies].sort((a, b) => {
      switch (key) {
        case "name": {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return direction === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        case "email": {
          const emailA = (a.businessEmail || "").toLowerCase();
          const emailB = (b.businessEmail || "").toLowerCase();
          return direction === "asc"
            ? emailA.localeCompare(emailB)
            : emailB.localeCompare(emailA);
        }
        case "clients":
          return direction === "asc"
            ? (a.totalClient || 0) - (b.totalClient || 0)
            : (b.totalClient || 0) - (a.totalClient || 0);
        case "status": {
          const sa = a.status ? "1" : "0";
          const sb = b.status ? "1" : "0";
          return direction === "asc"
            ? sa.localeCompare(sb)
            : sb.localeCompare(sa);
        }
        case "created":
          return direction === "asc"
            ? new Date(a.createdDate) - new Date(b.createdDate)
            : new Date(b.createdDate) - new Date(a.createdDate);
        case "modified": {
          const da = a.updatedDate ? new Date(a.updatedDate) : 0;
          const db = b.updatedDate ? new Date(b.updatedDate) : 0;
          return direction === "asc" ? da - db : db - da;
        }
        default:
          return 0;
      }
    });

    setFilteredAgencies(sorted);
  };

  const handleAgencyClick = (id) => {
    navigate(`/agencyDetails/${id}`);
  };

  const renderArrow = (colKey) => {
    if (sortConfig.key !== colKey) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className={`container mt-4 ${style.admin_container}`}>
      <div className={`card ${style.card}`}>
        <div
          className={`d-flex justify-content-between align-items-center p-3 text-white ${style.headerBar}`}
        >
          <h4 className="mb-0">Admin Panel</h4>
          <div className="input-group w-25">
            <input
              type="text"
              className="form-control"
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>

        <div className={style.table_container}>
          {loading ? (
            <p className="p-3 text-center">Loading...</p>
          ) : (
            <table className={`table ${style.metrics_table}`}>
              <thead>
                <tr>
                  <th>S.No</th>

                  <th
                    onClick={() => handleSort("name")}
                    className={` ${style.sortableHeader}`}
                  >
                    Agency Name
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("name")}
                    </span>
                  </th>

                  <th
                    onClick={() => handleSort("email")}
                    className={` ${style.sortableHeader}`}
                  >
                    Agency Email
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("email")}
                    </span>
                  </th>

                  <th
                    onClick={() => handleSort("clients")}
                    className={`${style.sortableHeader}`}
                  >
                    Total Clients
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("clients")}
                    </span>
                  </th>

                  <th
                    onClick={() => handleSort("status")}
                    className={` ${style.sortableHeader}`}
                  >
                    Status
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("status")}
                    </span>
                  </th>

                  <th
                    onClick={() => handleSort("created")}
                    className={` ${style.sortableHeader}`}
                  >
                    Created Date
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("created")}
                    </span>
                  </th>

                  <th
                    onClick={() => handleSort("modified")}
                    className={` ${style.sortableHeader}`}
                  >
                    Modified Date
                    <span className={`ms-1 ${style.sortArrow}`}>
                      {renderArrow("modified")}
                    </span>
                  </th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map((agency, index) => (
                    <tr key={agency.dA_UserIdf ?? index}>
                      <td>{index + 1}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleAgencyClick(agency.dA_UserIdf)}
                          className={style.link_button}
                        >
                          {`${agency.firstName} ${agency.lastName}`}
                        </button>
                      </td>
                      <td>{agency.businessEmail}</td>
                      <td>{agency.totalClient}</td>
                      <td>
                        <span
                          className={
                            agency.status
                              ? style.active_status
                              : style.inactive_status
                          }
                        >
                          {agency.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {agency.createdDate
                          ? new Date(agency.createdDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {agency.updatedDate
                          ? new Date(agency.updatedDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <a href="#" className={style.action_link}>
                          Edit
                        </a>
                        <span className="mx-1">|</span>
                        <a
                          href="#"
                          className={`${style.action_link} ${style.delete_link}`}
                        >
                          Delete
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No Agencies Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
