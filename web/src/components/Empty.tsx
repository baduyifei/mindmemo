import { DEFAULT_EMPTY_STATE_URL } from "@/helpers/consts";

const Empty = () => {
  return (
    <div className="mx-auto">
      <img src={DEFAULT_EMPTY_STATE_URL} className="w-24 h-24" alt="" />
    </div>
  );
};

export default Empty;
