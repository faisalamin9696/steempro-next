import { capitalize } from "@/libs/constants/AppConstants";
import {
  TableHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableProps,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import React, { Key } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { twMerge } from "tailwind-merge";
import LoadingCard from "../LoadingCard";

interface Props extends TableProps {
  initialVisibleColumns: string[];
  tableColumns: { name: string; uid: string; sortable?: boolean }[];
  filteredItems: any[];
  onFilterValueChange: (query: string) => void;
  filterValue?: string;
  rowClassName?: (item: any) => string;
  renderCell: (item: any, columnKey: Key) => React.ReactNode;
  baseVarient?: boolean;
  hidePaginationActions?: boolean;
  title?: string;
  topContentEnd?: React.ReactNode;
  headerColumnTitle?: string;
  topContentDropdown?: React.ReactNode;
  mobileVisibleColumns?: string[];
  inputClassName?: string;
  skipPaging?: boolean;
  isLoading?: boolean;
  cellWrapper?: (item: any, children: React.ReactNode) => React.ReactNode;
  stickyTop?: boolean;
}

function TableWrapper(props: Props) {
  const {
    initialVisibleColumns,
    tableColumns,
    filteredItems,
    onFilterValueChange,
    rowClassName,
    renderCell,
    baseVarient,
    hidePaginationActions,
    title,
    topContentEnd,
    headerColumnTitle,
    topContentDropdown,
    mobileVisibleColumns,
    filterValue,
    inputClassName,
    skipPaging,
    isLoading,
    cellWrapper,
    stickyTop,
  } = props;

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const pages = Math.ceil(filteredItems?.length / rowsPerPage);
  const { isMobile } = useDeviceInfo();

  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(
      isMobile
        ? mobileVisibleColumns || initialVisibleColumns
        : initialVisibleColumns
    )
  );
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: props.sortDescriptor?.column ?? "id",
    direction: props.sortDescriptor?.direction ?? "ascending",
  });

  const items = React.useMemo(() => {
    const start = 0;
    const end = start + filteredItems.length;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback(
    (value) => {
      if (value) {
        onFilterValueChange(value);
        setPage(1);
      } else {
        onFilterValueChange("");
      }
    },
    [filterValue]
  );

  const onClear = React.useCallback(() => {
    onFilterValueChange("");
    setPage(1);
  }, []);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return tableColumns;

    return tableColumns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const bottomContent = React.useMemo(() => {
    return (
      !!pages && (
        <div className="flex justify-between items-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />

          {!hidePaginationActions && !isMobile && (
            <div className="hidden sm:flex w-[30%] justify-end gap-2">
              <Button
                isDisabled={pages === 1}
                size="sm"
                variant="flat"
                onPress={onPreviousPage}
              >
                Previous
              </Button>
              <Button
                isDisabled={pages === 1}
                size="sm"
                variant="flat"
                onPress={onNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )
    );
  }, [items.length, page, pages]);

  const topContent = React.useMemo(() => {
    return (
      <div
        className={twMerge(
          "flex flex-col gap-4",
          stickyTop && "sticky top-0 z-20 pb-1 bg-default-50"
        )}
      >
        {title && <p className="text-lg font-semibold">{title}</p>}
        <div className="flex justify-between gap-3 items-center">
          <Input
            isClearable
            classNames={{
              inputWrapper:
                "text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            className={twMerge("w-full sm:max-w-[50%]", inputClassName)}
            placeholder="Search..."
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            value={filterValue}
          />
          {headerColumns && (
            <div className="flex gap-3">
              {topContentDropdown}
              {!topContentDropdown && (
                <Dropdown>
                  <DropdownTrigger className="">
                    <Button
                      endContent={<FaChevronDown className="text-small" />}
                      variant="flat"
                    >
                      {headerColumnTitle ?? "Columns"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Table Columns"
                    closeOnSelect={false}
                    selectedKeys={visibleColumns}
                    selectionMode="multiple"
                    onSelectionChange={setVisibleColumns}
                  >
                    {tableColumns.map((column) => (
                      <DropdownItem key={column.uid} className="capitalize">
                        {capitalize(column.name)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
              {topContentEnd}
            </div>
          )}
        </div>
        {skipPaging ? null : (
          <div className="flex items-center justify-end">
            {/* <div></div> */}
            {/* <span className="text-default-400 text-small">Total {allRows.length} delegations</span> */}
            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-none text-default-400 text-small"
                onChange={onRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
              </select>
            </label>
          </div>
        )}
      </div>
    );
  }, [
    visibleColumns,
    onRowsPerPageChange,
    onSearchChange,
    topContentDropdown,
    topContentEnd,
  ]);

  const classNames = React.useMemo(
    () => ({
      base: !baseVarient && [
        "bg-white/60",
        "dark:bg-white/10",
        "p-2",
        "rounded-lg",
      ],
      wrapper: ["max-h-[382px]", "max-w-3xl", props.classNames?.wrapper],
      th: ["text-default-500", "border-b", "border-divider"],
      td: [
        "",
        // changing the rows border radius
        // first
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
      ...props.classNames,
    }),
    []
  );

  if (isLoading) return <LoadingCard />;

  return (
    <Table
      isHeaderSticky={props.isHeaderSticky ?? false}
      aria-label="table"
      removeWrapper
      bottomContent={props.bottomContent ?? bottomContent}
      bottomContentPlacement={props.bottomContentPlacement ?? "outside"}
      classNames={classNames}
      sortDescriptor={sortDescriptor}
      topContent={props.topContent ?? topContent}
      topContentPlacement={props.topContentPlacement ?? "outside"}
      onSortChange={setSortDescriptor}
      isCompact={props.isCompact ?? true}
      isStriped={props.isStriped ?? true}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={"No data found"}
        items={
          skipPaging
            ? sortedItems
            : sortedItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)
        }
      >
        {(item) => (
          <TableRow
            key={item?.id ?? Math.random()}
            className={rowClassName && rowClassName(item)}
          >
            {(columnKey) => (
              <TableCell>
                {cellWrapper
                  ? cellWrapper(item, renderCell(item, columnKey))
                  : renderCell(item, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default TableWrapper;
