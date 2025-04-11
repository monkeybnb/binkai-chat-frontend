import { Thread } from "@/stores";
import ChannelItem from "./ChannelItem";

const LABEL = {
  today: "Today",
  yesterday: "Yesterday",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  pinned: "Pinned",
};

const ChannelGroup = ({
  labelKey,
  values,
}: {
  labelKey: string;
  values: Thread[];
}) => {
  if (!values?.length) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="text-label-small text-muted-foreground px-3">
        {LABEL[labelKey as keyof typeof LABEL]}
      </div>
      <div className="flex flex-col gap-1">
        {values.map((value) => (
          <ChannelItem key={value.id} thread={value} />
        ))}
      </div>
    </div>
  );
};

export default ChannelGroup;
