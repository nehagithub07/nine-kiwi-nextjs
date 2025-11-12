type Props = { percent: number };
export default function ProgressBar({ percent }: Props){
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
<<<<<<< HEAD
        <span className="text-sm font-medium">Form Input</span>
=======
        <span className="text-sm font-medium">Report Progress</span>
>>>>>>> 01ca953cebec308036f0219d017b0b68ffd7749a
        <span className="text-sm text-kiwi-green font-semibold" suppressHydrationWarning>
          {percent}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-kiwi-green h-2 rounded-full progress-bar" style={{width:`${percent}%`}} />
      </div>
    </div>
  );
}
