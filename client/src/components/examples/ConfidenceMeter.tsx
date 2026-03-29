import ConfidenceMeter from "../ConfidenceMeter";

export default function ConfidenceMeterExample() {
  return (
    <div className="space-y-6 p-6 max-w-md">
      <ConfidenceMeter confidence={95} />
      <ConfidenceMeter confidence={72} />
      <ConfidenceMeter confidence={45} />
    </div>
  );
}
