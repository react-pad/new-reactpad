
import { Input } from "@/components/ui/input";
import { PresaleCard } from "@/components/ui/presale-card";
import { usePresales } from "@/lib/hooks/usePresales";
import { Search } from "lucide-react";
import { useState } from "react";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" }
];

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { presales, isLoading } = usePresales();

  // Filtering is not implemented with live data yet.
  // This will require fetching status for each presale and then filtering.

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-7xl">
        <div className="mb-12 sm:mb-20 text-right lg:text-left">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6 tracking-tight">
            PROJECT<br />LAUNCHPAD
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light max-w-2xl lg:max-w-2xl ml-auto lg:ml-0">
            Discover, fund, and launch the next generation of decentralized applications.
          </p>
        </div>

        <div className="mb-16 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
            <Input
              placeholder="SEARCH PROJECTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 w-full h-16 text-lg border-2 border-black focus:ring-0 focus:border-black font-medium uppercase placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-2 border-black transition-all whitespace-nowrap ${activeFilter === filter.value
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p>Loading projects...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presales && presales.map((presale) => (
            <PresaleCard presaleAddress={presale} key={presale} />
          ))}
        </div>
      </div>
    </div>
  );
}
