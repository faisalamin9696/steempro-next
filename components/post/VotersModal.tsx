import moment from "moment";
import LoadingStatus from "../LoadingStatus";
import { ColumnDef, DataTable } from "../ui/data-table";
import SModal from "../ui/SModal";
import { useMemo } from "react";
import { usePostVoters } from "@/hooks/usePostVoters";
import SUsername from "../ui/SUsername";

interface VotersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: Post | Feed;
}

const VotersModal = ({ isOpen, onOpenChange, comment }: VotersModalProps) => {
  const { voters, isLoading, error } = usePostVoters(
    comment.author,
    comment.permlink,
    isOpen
  );

  const sortedVoters = useMemo(() => {
    if (!voters) return [];
    return [...voters].sort(
      (a, b) => Math.abs(Number(b.rshares)) - Math.abs(Number(a.rshares))
    );
  }, [voters]);

  // Calculate vote value from rshares (approximate)
  const formatVoteValue = (rshares: number): string => {
    const total_rs = comment.net_rshares;
    const percent_rs = rshares / total_rs;
    const value = comment.payout * percent_rs;
    // const value =
    //   (rs / Constants.globalProps.recent_reward_claims) *
    //   Constants.globalProps.total_reward_fund *
    //   Constants.globalProps.median_price;
    if (value < 0.001) return "<$0.001";
    if (value < 1) return `$${value.toFixed(3)}`;
    return `$${value.toFixed(2)}`;
  };

  const columns: ColumnDef<PostVote>[] = [
    {
      key: "voter",
      header: "Voter",
      searchable: true,
      render: (v, row) => {
        return (
          <div className="flex items-center gap-2 py-1">
            {/* <SAvatar username={v} size={32} /> */}
            <SUsername className="text-sm font-medium" username={`@${v}`} />
          </div>
        );
      },
    },
    {
      key: "rshares",
      header: "Value",
      sortable: true,
      render: (v, row) => (
        <span
          className={`text-sm font-medium  ${
            Number(v) >= 0 ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {formatVoteValue(v)}

          <span className="text-sm text-muted ml-1">
            ({(row.percent / 100).toFixed(0)}%)
          </span>
        </span>
      ),
    },

    {
      key: "time",
      header: "Since",
      sortable: true,
      render: (v) => (
        <span
          className="text-sm text-muted"
          title={moment.unix(v).toLocaleString()}
        >
          {moment.unix(v).fromNow(true)}
        </span>
      ),
    },
  ];

  return (
    <SModal
      title={() => (
        <div className="flex flex-row gap-2 items-center">
          <p>Voters</p>
          <p className="text-sm text-muted">({voters.length})</p>
        </div>
      )}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      {() =>
        isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingStatus />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : sortedVoters.length === 0 ? (
          <div className="text-center text-muted py-8">
            No voters found for this post.
          </div>
        ) : (
          <div className="flex-1 overflow-auto -mx-6 px-6">
            <DataTable
              data={sortedVoters}
              columns={columns}
              searchPlaceholder="Search voters..."
            />
          </div>
        )
      }
    </SModal>
  );
};

export default VotersModal;
