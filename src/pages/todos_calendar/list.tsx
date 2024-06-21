import { CheckOutlined, CloseOutlined, DeleteOutlined, XOutlined } from "@ant-design/icons";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  useForm,
} from "@refinedev/antd";
import {
  useCreate,
  useList,
  useMany,
  useOne,
  useUpdate,
  type BaseRecord,
} from "@refinedev/core";
import {
  Button,
  Calendar,
  CalendarProps,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { TableProps } from "antd/lib";
import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../utility";
import dayjs, { Dayjs } from "dayjs";
import { SpecificTodo } from "./show";

const { Text } = Typography;

export const TodoCalendar = () => {
  const { isLoading, data, error } = useList({ resource: "todo" });
  const [isSelected, setIsSelected] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Dayjs>();
  const handleSelect = (date: Dayjs) => {
    setIsSelected(true);
    setSelectedDay(date);
  };

  const callbackReturn = () => {
    setIsSelected(false);
    setSelectedDay(undefined);
  };

  const dateCellRender = (value: Dayjs) => {
    const getListData = (value: Dayjs) => {
      return data?.data.filter((item: any) => {
        return dayjs(item.day).isSame(value, "day");
      });
    };
    let dateData = getListData(value);
    return dateData?.length ? (
      <ul
        style={{
          padding: "0",
          listStyleType: "none",
        }}
      >
        {dateData[0].todo.items.map((item: any) => (
          <li>{item.name} - {item.checked ? <CheckOutlined/>:<CloseOutlined/> }</li>
        ))}
      </ul>
    ) : null;
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  return (
    <>
      <Card>
        {isSelected && selectedDay !== undefined ? (
          <SpecificTodo day={selectedDay} returnToCalendar={callbackReturn} />
        ) : (
          <Calendar onSelect={handleSelect} cellRender={cellRender} />
        )}
      </Card>
    </>
  );
};
