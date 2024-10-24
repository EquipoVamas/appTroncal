import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoaderContextType {
  modalVisible: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showLoader = () => {
    setModalVisible(true);
  };

  const hideLoader = () => {
    setModalVisible(false);
  };

  return (
    <LoaderContext.Provider value={{ modalVisible, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};
