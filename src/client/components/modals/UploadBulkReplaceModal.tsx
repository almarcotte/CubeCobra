import React, { useEffect,useMemo, useState } from 'react';

import Button from '../base/Button';
import Input from '../base/Input';
import { Flexbox } from '../base/Layout';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../base/Modal';
import Text from '../base/Text';
import CSRFForm from '../CSRFForm';

interface UploadBulkReplaceModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  cubeID: string;
}

const UploadBulkReplaceModal: React.FC<UploadBulkReplaceModalProps> = ({ isOpen, setOpen, cubeID }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const formRef = React.createRef<HTMLFormElement>();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const formData = useMemo(
    () => ({
      file: fileContent,
    }),
    [fileContent],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} setOpen={setOpen} md>
      <CSRFForm method="POST" action={`/cube/bulkreplacefile/${cubeID}`} ref={formRef} formData={formData}>
        <ModalHeader setOpen={setOpen}>Upload Bulk Replace</ModalHeader>
        <ModalBody>
          <Text>Upload a CSV file to replace the current cube list.</Text>
          <Input type="file" name="file" accept=".csv" onChange={handleFileChange} />
        </ModalBody>
        <ModalFooter>
          <Flexbox direction="row" justify="between" gap="2" className="w-full">
            <Button color="primary" type="submit" disabled={!file} block onClick={() => formRef.current?.submit()}>
              Upload
            </Button>
            <Button color="secondary" onClick={() => setOpen(false)} block>
              Close
            </Button>
          </Flexbox>
        </ModalFooter>
      </CSRFForm>
    </Modal>
  );
};

export default UploadBulkReplaceModal;
