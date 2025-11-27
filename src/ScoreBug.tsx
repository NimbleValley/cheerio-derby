const ScoreBug = ({ score, outs, maxDistance, exitVelocity }: { score: number, outs: number, maxDistance?: number | null, exitVelocity?: number | null }) => {

    return (
        <div className="select-none cursor-none fixed left-5 bottom-5 w-45">
            <div className="px-5 py-3 bg-gray-100 border-3 border-gray-800 rounded-lg flex flex-col gap-2 justify-center items-center shadow-2xl shadow-black/50 text-3xl font-semibold z-1">
                <div className="flex flex-row items-center gap-3">
                    <h1 className="text-gray-900">Score: </h1>
                    <h2 className="text-5xl font-regular">{score}</h2>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <h1 className="text-gray-900">Outs: </h1>
                    <h2 className="text-5xl font-regular">{outs}</h2>
                </div>
            </div>
            {maxDistance &&
                <div className="w-35 left-5 absolute flex flex-row -top-7 pb-10 bg-gray-300 border-2 px-5 border-gray-800 rounded-md flex flex-col gap-2 justify-center items-center shadow-2xl shadow-black/50 text-lg font-regular -z-1">
                    <h1>Longest: </h1>
                    <h1>{Math.round(maxDistance)}'</h1>
                </div>
            }
        </div>
    );
}

export default ScoreBug;