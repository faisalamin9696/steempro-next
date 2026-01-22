import { useSdsList } from "@/hooks/sds-client-hooks";
import { ColumnDef, DataTable } from "../ui/data-table";
import { Card, CardBody } from "@heroui/card";
import {  Chip } from "@heroui/chip";
import Link from "next/link";
import SUsername from "../ui/SUsername";
import moment from "moment";
import LoadingStatus from "../LoadingStatus";
import { Link2 } from "lucide-react";

function CommuntiyLog({ account }: { account: string }) {
  const { data, error, isLoading } = useSdsList<CommunityLog>(
    `/communities_api/getCommunityActivityLogs/${account}`
  );

  const columns: ColumnDef<CommunityLog>[] = [
    {
      key: "account",
      render: (value, row) => <SUsername username={`@${value}`} />,
      header: "Username",
      sortable: true,
      searchable: true,
    },

    {
      key: "type",
      render: (value, row) => (
        <span className={getTypeColor(row.type)}>{value}</span>
      ),
      header: "Type",
      className: "font-mono sticky left-14 z-10 min-w-[180px]",
      searchable: true,
    },
    {
      key: "data",
      render: (value, row) => {
        const data = JSON.parse(row.data || "{}");

        const url = data?.permlink ? `/@${data.author}/${data.permlink}` : "";
        const title = getLogDescription(row);

        return (
          <div className="flex flex-col items-start gap-1">
            {url ? (
              <Chip
                className="transition-colors delay-50 hover:text-blue-500"
                as={Link}
                href={url}
                size="sm"
                variant="flat"
                classNames={{ content: "flex flex-row gap-1 items-center" }}
              >
                <Link2 size={16} />
                {url.substring(0, 24).replace("/", "")}...
              </Chip>
            ) : (
              title
            )}
            <p className="text-xs text-muted">
              {moment.unix(row.created).fromNow()}
            </p>
          </div>
        );
      },
      header: "Description",
    },
  ];

  if (error) {
    return <p>{error}</p>;
  }

  return isLoading || !data ? (
    <LoadingStatus />
  ) : (
    <Card className="card max-h-100 overflow-auto">
      <CardBody>
        <DataTable columns={columns} data={data} />
      </CardBody>
    </Card>
  );
}

export default CommuntiyLog;

function getLogDescription(log: CommunityLog) {
  const data = JSON.parse(log.data || "{}");

  let description: React.ReactNode;

  switch (log.type) {
    case "flagPost":
    case "pinPost":
    case "unpinPost":
    case "unmutePost":
    case "mutePost":
      description = (
        <div className=" flex flex-col gap-2">
          {data?.notes && <p className="text-tiny">Reason: {data.notes}</p>}
        </div>
      );

      break;

    case "setRole":
      description = (
        <div className=" flex flex-col gap-2">
          <SUsername username={`/@${data.target}`} />

          {data?.role && <p className="text-tiny">{data.role}</p>}
        </div>
      );
      break;

    case "setUserTitle":
      description = (
        <div className=" flex flex-col gap-2">
          <SUsername username={`@${data.target}`} />

          {data?.title && <p className="text-tiny">{data.title}</p>}
        </div>
      );
      break;

    default:
      description = "";
      break;
  }

  return description;
}

function getTypeColor(type: string) {
  return type === "subscribe" || type === "pinPost"
    ? "text-green-500"
    : type === "mutePost" ||
      type === "flagPost" ||
      type === "unpinPost" ||
      type === "unsubscribe"
    ? "text-red-400"
    : "text-blue-400";
}
