import React, { createContext, useContext, useState, useCallback } from "react";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isChangingSelection, setIsChangingSelection] = useState(false);

  const toggleEmployeeSelection = useCallback((employeeId) => {
    setIsChangingSelection(true);
    
    setTimeout(() => {
      if (selectedEmployee === employeeId) {
        setSelectedEmployee(null);
      } else {
        setSelectedEmployee(employeeId);
      }
      
      setTimeout(() => {
        setIsChangingSelection(false);
      }, 10);
    }, 10);
  }, [selectedEmployee]);

  return (
    <EmployeeContext.Provider
      value={{
        selectedEmployee,
        toggleEmployeeSelection,
        isChangingSelection,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);