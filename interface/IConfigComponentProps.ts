interface IConfigComponentProps {
  id: number;
  setIsDirtyFunction: (id: number, isDirty: boolean) => void;
  registerSaveFunction: (id: number, saveFunc: () => void) => void;
}

export default IConfigComponentProps;
