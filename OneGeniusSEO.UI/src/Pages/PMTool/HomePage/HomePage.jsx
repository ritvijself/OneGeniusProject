import React from "react";
import { useNavigate } from "react-router";
import ClientCard from "./components/ClientCard";
import AddNewClientCard from "./components/AddNewClientCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

// const agencyName = "Innovate Digital";
// const clients = [
//   {
//     id: 1,
//     name: "QuantumLeap Corp",
//     website_url: "https://www.quantumleap.com/long-url-example",
//     project_manager: "Alice Johnson",
//     scope: "Digital Marketing",
//   },
//   {
//     id: 2,
//     name: "Stellar Solutions",
//     website_url: "https://stellarsolutions.dev",
//     project_manager: "Bob Williams",
//     scope: "Digital Marketing",
//   },
//   {
//     id: 3,
//     name: "Nexus Innovations",
//     website_url: "https://nexusinnovations.io",
//     project_manager: "Charlie Brown",
//     scope: "Digital Marketing",
//   },
//   {
//     id: 4,
//     name: "Apex Dynamics",
//     website_url: "https://apexdynamics.co",
//     project_manager: "Diana Miller",
//     scope: "Digital Marketing",
//   },
// ];

export const HomePage = () => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/api/clients");
      return data;
    },
  });

  const clients = data?.clients || [];
  const user = data?.user || {};

  return (
    <div className="tw:max-w-7xl tw:mx-auto tw:px-4 tw:py-8 tw:sm:px-6 tw:lg:px-12">
      {/* Workspace Header */}
      <div className="tw:flex tw:items-center tw:gap-4 tw:mb-6">
        <div>
          <div className="tw:text-2xl tw:font-bold tw:text-gray-800">
            {user.firstName} {user.lastName}
          </div>
          <div className="tw:text-lg tw:text-gray-500">Clients</div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:md:grid-cols-3 tw:lg:grid-cols-5 tw:gap-6">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => {
              navigate(`clients/${client.id}`);
            }}
          />
        ))}

        <AddNewClientCard />
      </div>
    </div>
  );
};

export default HomePage;
