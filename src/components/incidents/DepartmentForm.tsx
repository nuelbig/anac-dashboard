import React, { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Department } from "../../types/department";

interface DepartmentFormProps {
  initialData?: Department;
  onSubmit: (data: Department) => void;
  isLoading: boolean;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Department>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Department, string>>>(
    {}
  );

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
      });
    }
  }, [initialData]);

  // Gestion des changements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof Department]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Department, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
    >
      <div className="space-y-4">
        <Input
          label="Department Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter department name"
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter department description"
            className={`w-full px-3 py-2 rounded-md border ${
              errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            rows={4}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update Department" : "Create Department"}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
