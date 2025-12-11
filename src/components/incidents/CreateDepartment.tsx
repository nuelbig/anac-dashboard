import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Department } from "../../types/department";
import Swal from "sweetalert2";
import { createDepartment } from "../../services/departmentService";
import DepartmentForm from "./DepartmentForm";

const CreateDepartment: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createDepartment,
    gcTime: 1000 * 60 * 60, // 1 heure
    onSuccess: async () => {
      await Swal.fire({
        title: "Succès",
        text: "Department created successfully!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      navigate("/app/department");
    },
    onError: () => {
      Swal.fire({
        title: "Erreur",
        text: "Failed to create department. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    },
  });

  const handleSubmit = (data: Department) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/app/department"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">Create New Department</h1>
      </div>

      <DepartmentForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};

export default CreateDepartment;   