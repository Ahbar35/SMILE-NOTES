import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input } from "antd";
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { firestore } from "config/firebase";
import { useAuthContext } from "contexts/AuthContext";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const All = () => {
  const { user, isAuthenticated, isAppLoading } = useAuthContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedUsers, setEditedUsers] = useState([]);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchItems = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(firestore, "items"));
        const querySnapshot = await getDocs(q);

        const itemsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data };
        });

        setItems(itemsList);
        
        // Extract unique emails of users who edited items
        const uniqueEmails = [...new Set(itemsList.map(item => item.updatedBy).filter(email => email))];
        setEditedUsers(uniqueEmails);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isAppLoading) {
      fetchItems();
    }
  }, [isAuthenticated, user, isAppLoading]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, "items", id));
      setItems(items.filter(item => item.id !== id));
      window.toastify("Item deleted", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      window.toastify("Failed to delete item", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { itemName, description } = values;

      // Update the Firestore document with the user's name
      await updateDoc(doc(firestore, "items", editingItem.id), {
        itemName,
        description,
        updatedBy: user.displayName || user.email,
      });

      // Update the local state
      setItems(items.map(item => (
        item.id === editingItem.id
          ? { ...item, itemName, description, updatedBy: user.displayName || user.email }
          : item
      )));
      setIsModalVisible(false);
      window.toastify("Item updated", "success");
    } catch (error) {
      console.error("Error updating item:", error);
      window.toastify("Failed to update item", "error");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'itemName',
      key: 'name',
      render: (name) => <span style={{ fontSize: "14px" }}>{name}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <span style={{ fontSize: "12px", padding: "0 10px" }}>{description}</span>
      ),
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: (name) => <span style={{ fontSize: "12px", padding: "0 10px" }}>{name}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
            style={{ marginRight: 8 }} 
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
            danger 
          />
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "10px", maxWidth: "100%" }}>
      <h2 className="text-center" style={{ fontSize: "25px", marginBottom: "10px" }}>All Notes</h2>
      <Table
        loading={loading}
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
      <Button 
        onClick={() => setIsUserModalVisible(true)} 
        style={{ marginTop: 16 }}>
        Show Users Who Edited Items
      </Button>
      <Modal 
        title="Users Who Edited Items" 
        visible={isUserModalVisible} 
        onOk={() => setIsUserModalVisible(false)} 
        onCancel={() => setIsUserModalVisible(false)}
      >
        <ul>
          {editedUsers.map((email, index) => (
            <li key={index}>{email}</li>
          ))}
        </ul>
      </Modal>
      <Modal 
        title="Edit Item" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="itemName"
            label="Name"
            rules={[{ required: true, message: 'Please enter the Note Name' }]}
          >
            <Input placeholder="Enter item name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter item description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default All;

