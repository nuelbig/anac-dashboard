import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDepartmentById, updateDepartment } from "../../services/departmentService";
import { Department } from "../../types/department";
import DepartmentForm from "./DepartmentForm";


const EditDepartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: department, isLoading, error } = useQuery({
    queryKey: ["department", id],
    queryFn: () => getDepartmentById(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: async () => {
      await Swal.fire({
        title: "Succès",
        text: "Department has been updated.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
      queryClient.invalidateQueries({ queryKey: ["department"] });
      navigate(`/app/department/${id}`);
    },
    onError: () => {
      Swal.fire({
        title: "Erreur",
        text: "Error updating department. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    },
  });

  const handleSubmit = (data: Department) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
        {error ? "Failed to load department details" : "Department not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to={`/app/department/${id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Edit Department</h1>
      </div>

      <DepartmentForm
        initialData={department}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default EditDepartment;   