import React from "react";
import { Link } from "react-router-dom";
import { FileSearch } from "lucide-react";
import Button from "../components/ui/Button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-8">
          <FileSearch className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          404
        </h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
