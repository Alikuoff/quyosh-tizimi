export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-white border-b-transparent border-l-transparent animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-transparent border-b-white border-l-transparent animate-spin animation-delay-300"></div>
        </div>
        <h2 className="text-white text-xl font-bold">Sayyoralar yuklanmoqda...</h2>
        <p className="text-white/70 text-sm mt-2">Quyosh tizimi tayyorlanmoqda</p>
      </div>
    </div>
  )
}

