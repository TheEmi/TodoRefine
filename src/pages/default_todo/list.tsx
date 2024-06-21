import { DeleteOutlined } from "@ant-design/icons";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  useForm,
} from "@refinedev/antd";
import {
  BaseKey,
  useList,
  useMany,
  useOne,
  useUpdate,
  type BaseRecord,
} from "@refinedev/core";
import { Button, Form, Input, Space, Table } from "antd";
import { TableProps } from "antd/lib";
import { useEffect, useState } from "react";

export const Default_todo = () => {
  const { data, isLoading } = useList({ resource: "default_todo" });
  const [items, setItems] = useState([]);
  const { form, formProps, saveButtonProps, queryResult, onFinish } = useForm(
    {}
  );
  const { mutate } = useUpdate({});
  useEffect(() => {
    if (data) {
      const itemsData = data?.data[0].defaults.items;
      form.setFieldsValue({ defaults: itemsData });
      if (itemsData) setItems(itemsData);
    }
  }, [data]);

  const saveChanges = () => {
    try {
      form.validateFields().then(() => {
        let newDefaults = form.getFieldValue("defaults").map((item: any) => {
          return { name: item.name, checked: false };
        });
        if(data?.data[0].id === undefined) return;
          mutate({
            resource: "default_todo",
            id: data?.data[0].id as BaseKey,
            values: { defaults: { items: newDefaults } },
          });
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Form form={form}>
        <Form.List name={"defaults"}>
          {(fields, operator) => {
            return (
              <>
                <Table
                  dataSource={fields}
                  loading={isLoading}
                  pagination={false}
                  rowKey={(record) => record.key}
                >
                  <Table.Column
                    dataIndex="name"
                    title={"Item"}
                    render={(index, field: any) => {
                      return (
                        <Form.Item
                          name={[field.name, "name"]}
                          initialValue={form.getFieldValue([
                            "defaults",
                            field.name,
                            "name",
                          ])}
                          style={{ margin: 0 }}
                          rules={[
                            { required: true, message: "Please enter a name" },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      );
                    }}
                  />
                  <Table.Column
                    title={"Actions"}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                      <Space>
                        <Button
                          icon={<DeleteOutlined style={{color: "red"}}/>}
                          size="small"
                          onClick={() => {operator.remove(record.key);}}
                        />
                      </Space>
                    )}
                  />
                </Table>
                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    onClick={() => {
                      operator.add();
                    }}
                  >
                    Add an item
                  </Button>
                </Form.Item>
              </>
            );
          }}
        </Form.List>
        <Space align="center">
          <Button type="primary" onClick={saveChanges}>
            Save
          </Button>
        </Space>
      </Form>
    </>
  );
};
