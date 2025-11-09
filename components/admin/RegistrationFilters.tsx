"use client";

import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";

interface RegistrationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterByUniversity: string;
  setFilterByUniversity: (value: string) => void;
  filterByDivision: string;
  setFilterByDivision: (value: string) => void;
  filterByYear: string;
  setFilterByYear: (value: string) => void;
  universities: string[];
  divisions: string[];
  years: number[];
  onClearFilters: () => void;
  onExport: () => void;
}

export function RegistrationFilters({
  searchTerm,
  setSearchTerm,
  filterByUniversity,
  setFilterByUniversity,
  filterByDivision,
  setFilterByDivision,
  filterByYear,
  setFilterByYear,
  universities,
  divisions,
  years,
  onClearFilters,
  onExport,
}: RegistrationFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name, ID, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* University filter */}
      <Select value={filterByUniversity} onValueChange={setFilterByUniversity}>
        <SelectTrigger>
          <SelectValue placeholder="All Universities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Universities</SelectItem>
          {universities.map((university) => (
            <SelectItem key={university} value={university}>
              {university}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Division filter */}
      <Select value={filterByDivision} onValueChange={setFilterByDivision}>
        <SelectTrigger>
          <SelectValue placeholder="All Divisions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Divisions</SelectItem>
          {divisions.map((division) => (
            <SelectItem key={division} value={division}>
              {division}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year filter */}
      <Select value={filterByYear} onValueChange={setFilterByYear}>
        <SelectTrigger>
          <SelectValue placeholder="All Years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              Year {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClearFilters} className="flex-1">
          Clear
        </Button>
        <Button onClick={onExport} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}