import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { DirectoryRegion } from "@/lib/data-connect/directory-service";

interface LocationGridProps {
  regions: DirectoryRegion[];
}

export default function LocationGrid({ regions }: LocationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {regions.map((region) => (
        <div
          key={region.id}
          className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group"
        >
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-[#2563EB] rounded-lg transition-colors duration-300">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-sans font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors duration-300">
                {region.name}
              </h2>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">
              Explore businesses and directory listings located within the {region.name}.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                {region.provinceCount !== undefined
                  ? `${region.provinceCount} Provinces`
                  : "View Region"}
              </span>
              
              <Link
                href={`/locations/${region.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors"
              >
                <span>Browse</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
