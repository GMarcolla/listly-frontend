export default function HeroSection() {
  return (
    <div className="relative bg-gray-900 py-24 sm:py-32 bg-[url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2869&auto=format&fit=crop')] bg-cover bg-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gray-900/70" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
          Comece sua jornada
        </h1>
      </div>
    </div>
  );
}
