import type { GameType } from "./types";

export default function MainMenu({setGameType, setMenu}:{setGameType: (arg0: GameType) => void, setMenu: (arg0:boolean) => void}) {
    return (
        <div className="w-full h-full fixed l-0 t-0 bg-black/50 flex items-center justify-center select-none">
            <div className="min-w-[50%] px-10 py-15 bg-gray-100 border-5 border-gray-700 rounded-xl flex flex-col gap-6 justify-center items-center shadow-2xl shadow-black/50">
                <h1 className="text-7xl text-red-600 font-bold text-center text-shadow-lg text-shadow-red-800/25">Cheerio Derby</h1>
                <h1 className="text-3xl text-blue-600 font-semibold text-center text-shadow-md text-shadow-blue-400/50">Hit it out of the park!</h1>
                <div className="mt-5 text-xl flex gap-5">
                    <button onClick={() => {setMenu(false); setGameType('Single');}} className="rounded-md border-2 border-gray-800 px-7 py-2 transition cursor-pointer hover:scale-110 hover:border-red-600 hover:shadow-black/67 shadow-lg duration-350">Play local</button>
                    <button onClick={() => alert('This mode is nto finished yet!')} className="rounded-md border-2 border-gray-800 px-7 py-2 transition cursor-pointer hover:scale-110 hover:border-blue-600 hover:shadow-black/67 shadow-lg duration-350">Join online game</button>
                </div>
            </div>
        </div>
    )
}