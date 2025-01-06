import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({ title, open, handleOk, confirmLoading, handleCancel, children }) => {
    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            width={350}
            style={{ top: '10px', textAlign: 'center' }}
        >
            {children}
        </Modal>
    )
}

export default ModalComponent