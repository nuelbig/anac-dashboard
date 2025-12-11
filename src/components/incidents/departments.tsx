import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

import {
  deleteDepartment,
  getDepartments,
} from "../../services/departmentService"; 
import Button from "../ui/Button";
import Card from "../ui/Card";


const Departments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordPerPage: number = 5;

  const queryClient = useQueryClient();

  // Fetch Departments
  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to delete this department?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
        Swal.fire({
          title: "Deleted!",
          text: "Department deleted successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      }
    });
  };

  // Filter
  const filteredDepartments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return departments.filter((d) =>
      d.name.toLowerCase().includes(term)
    );
  }, [departments, searchTerm]);

  // Pagination
  const paginatedDepartments = useMemo(() => {
    const lastIndex = currentPage * recordPerPage;
    const firstIndex = lastIndex - recordPerPage;
    return filteredDepartments.slice(firstIndex, lastIndex);
  }, [filteredDepartments, currentPage, recordPerPage]);

  //const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearchChange = (value: string) => setSearchTerm(value);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
        Failed to load departments.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEARCH + CREATE BUTTON */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white"></h1>

        <div className="border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search department..."
              className="pl-10 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Link to="new">
              <Button>Add New Department</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDepartments.length > 0 ? (
                paginatedDepartments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {department.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {department.description}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-start space-x-2">
                        <Link
                          to={`/app/department/${department.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          to={`/app/department/edit/${department.id}`}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Edit Department"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() => handleDelete(department.id!)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Department"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No departments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PAGINATION */}
      {/* <Pagination
        currentPage={currentPage}
        totalItems={filteredDepartments.length}
        itemsPerPage={recordPerPage}
        onPageChange={handlePageChange}
      /> */}
    </div>
  );
};

export default Departments;
