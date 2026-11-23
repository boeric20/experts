import { MODEL_LABEL, type ModelAlias } from "../lib/team";

export function ModelBadge({ model }: { model: ModelAlias }) {
  return <span className={`badge badge-${model}`}>{MODEL_LABEL[model]}</span>;
}
