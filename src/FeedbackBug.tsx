const FeedbackBug = ({ currentDistance }: { currentDistance: number }) => {

    return (
        <div className="select-none cursor-none fixed right-5 bottom-5 w-40">
            <div className="px-3 py-3 bg-gray-100 border-3 border-gray-800 rounded-lg flex flex-col gap-2 justify-center items-center shadow-2xl shadow-black/50 text-4xl font-semibold z-1">
                <div className="flex flex-row items-center gap-3">
                    <h2 className="text-5xl font-regular">{currentDistance}'</h2>
                </div>
            </div>
        </div>
    );
}

export default FeedbackBug;