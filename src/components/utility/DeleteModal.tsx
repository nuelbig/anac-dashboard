import React from 'react'
import Modal from '../ui/Modal';

interface DeletedModalProps {
  setIsDeletedModalOpen: () => void;
  confirmDelete: () => void;
  deleteAction:boolean;
  name:string;
}

const DeleteModal: React.FC<DeletedModalProps> = ({setIsDeletedModalOpen, confirmDelete, deleteAction, name}) => {
  return (
    <Modal onClose={setIsDeletedModalOpen} size="sm">
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-center">Confirmer la suppression</h2>
      <p className="mb-2">Voulez-vous vraiment supprimer {name} ?</p>
      <p className='mb-6 text-red-500'>Cette action est irréversible.</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={setIsDeletedModalOpen}
          className={`px-4 py-2 rounded dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Annuler
        </button>
        <button
          onClick={confirmDelete}
          className={`px-4 py-2 rounded dark:bg-red-600 dark:text-white dark:hover:bg-red-500 bg-red-500 text-white hover:bg-red-600`}
        >
               {deleteAction ? (
          <div className='flex items-center gap-1'>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
           <span> suppression en cours</span>
          </div>
        ) : (
          <div className='flex items-center'>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
           <span> supprimer</span>
          </div>
        )}
        </button>
      </div>
    </div>
  </Modal>
  )
}

export default DeleteModal