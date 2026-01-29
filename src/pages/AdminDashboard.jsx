import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost/vizsga/api/admin_check.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (!data.logged_in) {
          navigate("/admin-login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        navigate("/admin-login");
      });
  }, []);

  if (loading) {
    return <div className="text-white">Betöltés...</div>;
  }

  return (
    <div className="text-white text-3xl font-bold">
      ADMIN DASHBOARD
    </div>
  );
}
