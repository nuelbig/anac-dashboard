import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Building2, Info } from "lucide-react";
import { getDepartmentById } from "../../services/departmentService";
import { Department } from "../../types/department";
import Card from "../ui/Card";
import Button from "../ui/Button";

const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: department, isLoading, isError, error } = useQuery<Department>({
    queryKey: ["department", id],
    queryFn: () => getDepartmentById(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
        {(error as Error)?.message || "Department not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            to="/app/department"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold">{department.name}</h1>
        </div>

        <Link to={`/app/department/edit/${department.id}`}>
          <Button className="flex items-center gap-2">
            <Edit size={16} />
            Edit Department
          </Button>
        </Link>
      </div>

      <Card title="Department Information">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Building2 size={18} className="text-gray-500 dark:text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium">{department.name}</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <Info size={18} className="text-gray-500 dark:text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="font-medium">{department.description || "N/A"}</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DepartmentDetails;   