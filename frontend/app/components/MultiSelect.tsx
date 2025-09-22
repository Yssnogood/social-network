"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

type MultiSelectProps = {
  options: any[];
  selected: any[];
  onChange: (selected: any[]) => void;
  placeholder?: string;
};

/**
 * A multi-select component that allows the user to select multiple options from a list of options.
 * @param {string[]} options The list of options to select from.
 * @param {string[]} selected The currently selected options.
 * @param {(selected: string[]) => void} onChange A callback function that is called when the user selects or unselects an option.
 * @param {string} [placeholder="Select options..."] The placeholder text that is displayed when the user has not yet selected any options.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const selectables = options.filter((option) => !selected.includes(option));

  return (
    <Command className="overflow-visible bg-transparent [&_[data-slot=command-input-wrapper]_svg]:text-zinc-400">
      <div className="group border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors mt-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((option) => {
            return (
              <Badge key={option.username} variant="secondary" className="bg-zinc-700 text-white border-zinc-600 hover:bg-zinc-600 transition-colors flex items-center gap-1.5 pl-1 pr-2 py-1">
                <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0">
                  {option.avatar_path ? (
                    <img
                      src={
                        option.avatar_path.startsWith("http")
                          ? option.avatar_path
                          : `/uploads/${option.avatar_path}`
                      }
                      alt={`${option.username}'s avatar`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">
                        {option.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs">{option.username}</span>
                <button
                  className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-zinc-400 hover:text-white transition-colors" />
                </button>
              </Badge>
            );
          })}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent text-white placeholder:text-zinc-400 outline-none flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border border-zinc-700 bg-zinc-800 text-white shadow-lg outline-none animate-in">
            <CommandList>
              <CommandEmpty className="text-zinc-400 px-3 py-2">No results found.</CommandEmpty>
              <CommandGroup className="h-full overflow-auto max-h-48">
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option.username}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue("");
                        onChange([...selected, option]);
                      }}
                      className={"cursor-pointer hover:bg-zinc-700 px-3 py-2 transition-colors text-zinc-200 hover:text-white"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onChange([...selected, option]);
                          setInputValue("");
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                          {option.avatar_path ? (
                            <img
                              src={
                                option.avatar_path.startsWith("http")
                                  ? option.avatar_path
                                  : `/uploads/${option.avatar_path}`
                              }
                              alt={`${option.username}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {option.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span>{option.username}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  );
}