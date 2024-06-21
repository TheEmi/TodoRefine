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
  useCreate,
  useList,
  useMany,
  useOne,
  useUpdate,
  type BaseRecord,
} from "@refinedev/core";
import { Button, Card, Checkbox, Form, Input, Space, Table, Typography } from "antd";
import { TableProps } from "antd/lib";
import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../utility";
import dayjs from "dayjs";

const { Text } = Typography;

export const TodayTodo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dataId, setDataId] = useState<Number>();
  const { mutate } = useUpdate({});
  const {mutate: mutateCreate , data: createData} = useCreate({});
  const { form } = useForm({});
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    supabaseClient
      .rpc("get_todo_by_day", { current_day: dayjs().format("YYYY-MM-DD") })
      .then((data) => {
        if (data.data.length > 0) {
          setDataId(data.data[0].id);
          form.setFieldsValue({ defaults: data.data[0].todo.items });
        }else{
          supabaseClient.from("default_todo").select("*").then((data) => {
            if(data.data){
            mutateCreate({
              resource: "todo",
              values: { todo: {items: data.data[0].defaults.items}, day: dayjs().format("YYYY-MM-DD") },
            });
            form.setFieldsValue({ defaults: data.data[0].defaults.items });
          }
          });
        }
        setIsLoading(false);
      });
    }, [mutateCreate, form]);
    useEffect(() => {setDataId(createData?.data.id as Number)},[createData]);
  const handleCheckboxChange = (index: any) => {
    const newItems = form
      .getFieldValue("defaults")
      .map((item: any, indexList: number) => {
        if (indexList === index) {
          return { name: item.name, checked: !item.checked };
        }
        return item;
      });
    form.setFieldsValue({ defaults: newItems });
    if(dataId !== undefined)
      mutate({
        resource: "todo",
        id: dataId as BaseKey,
        values: { todo: { items: newItems } },
      });
  };

  const saveChanges = () => {
    try {
      form.validateFields().then(() => {
        let newDefaults = form.getFieldValue("defaults").map((item: any) => {
          return { name: item.name, checked: false };
        });
        mutate({
          resource: "todo",
          id: dataId as BaseKey,
          values: { todo: { items: newDefaults } },
        });
        setIsEditing(false);
      });
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Card>
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
                          {isEditing ? (
                            <Input />
                          ) : (
                            <Text>
                              {form.getFieldValue([
                                "defaults",
                                field.name,
                                "name",
                              ])}
                            </Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  />
                  <Table.Column
                    title={"Actions"}
                    dataIndex="actions"
                    render={(index, record: BaseRecord) => (
                      <Space>
                        {isEditing ? (
                          <Button
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                            size="small"
                            onClick={() => {
                              operator.remove(record.key);
                            }}
                          />
                        ) : (
                          <Form.Item
                            name={[record.name, "checked"]}
                            valuePropName="checked"
                            style={{margin: "0"}}
                          >
                            <Checkbox
                              onChange={() => handleCheckboxChange(index)}
                            />
                          </Form.Item>
                        )}
                      </Space>
                    )}
                  />
                </Table>
                {isEditing ? (
                  <Form.Item>
                    <Button
                      type="dashed"
                      block
                      onClick={() => {
                        setIsEditing(true);
                        operator.add();
                      }}
                    >
                      Add an item
                    </Button>
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
        <Space align="center">
          {isEditing ? (
            <Button type="primary" onClick={saveChanges}>
              Save
            </Button>
          ) : (
            <Button style={{marginTop: "18px"}} type="primary" onClick={() => setIsEditing(!isEditing)}>
              Edit
            </Button>
          )}
        </Space>
      </Form>
    </Card>
  );
};
