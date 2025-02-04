import React from 'react';

import QRCode from 'react-qr-code';

import Button from '../base/Button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../base/Modal';

interface QRCodeModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  link: string;
  cubeName: string;
}

const saveQRImage = (cubeName: string) => {
  const svg = document.getElementById('qr-code') as HTMLElement;
  const data = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([data], { type: 'image/svg+xml' });

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(svgBlob);
  a.download = `QR-${cubeName.replace(/\s/g, '_')}.svg`;
  a.click();
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, setOpen, link, cubeName }) => (
  <Modal md isOpen={isOpen} setOpen={setOpen}>
    <ModalHeader setOpen={setOpen}>Link to {cubeName}</ModalHeader>
    <ModalBody>
      <div className="centered">
        <div className="p-3 qr-code-area">
          <QRCode id="qr-code" value={link} />
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => saveQRImage(cubeName)}>
        Download
      </Button>
      <Button color="secondary" onClick={() => setOpen(false)}>
        Close
      </Button>
    </ModalFooter>
  </Modal>
);

export default QRCodeModal;
