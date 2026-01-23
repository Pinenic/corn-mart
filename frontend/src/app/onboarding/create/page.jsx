"use client";
import { useState, useEffect } from "react";

export default function CreateStoreForm() {
  useEffect(() => {
    document.title = 'Create Store | Corn Mart';
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_id: "", // you’ll fill this dynamically (e.g. from user session)
  });
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "logo") setLogo(e.target.files[0]);
    if (e.target.name === "banner") setBanner(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (logo) data.append("logo", logo);
    if (banner) data.append("banner", banner);

    try {
      const res = await fetch("http://localhost:5000/api/stores", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to create store");

      setMessage(result.message,"✅ Store created successfully!");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 max-w-7xl mx-auto ">
        <h1 className=""> Welcome to store onboarding</h1>
      <form onSubmit={handleSubmit} className="flex flex-col border-1 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Store name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="owner_id"
          placeholder="Owner ID"
          value={formData.owner_id}
          onChange={handleChange}
          required
        />
        <label>
          Logo: <input type="file" name="logo" onChange={handleFileChange} />
        </label>
        <label>
          Banner:{" "}
          <input type="file" name="banner" onChange={handleFileChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Store"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
