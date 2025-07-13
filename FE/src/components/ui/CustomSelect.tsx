"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Chọn...",
    label,
    className = "",
    disabled = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div
            className={`flex flex-col gap-3 relative ${className}`}
            ref={selectRef}
        >
            {label && (
                <label className="text-base font-bold text-gray-700">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex items-center justify-between px-8 py-5 text-lg 
                    bg-white rounded-3xl transition-all shadow-sm hover:shadow-md
                    ${
                        disabled
                            ? "bg-gray-100 cursor-not-allowed text-gray-400"
                            : "hover:bg-gray-50 cursor-pointer"
                    }
                    ${isOpen ? "shadow-md ring-2 ring-red-200 bg-red-50" : ""}
                    focus:outline-none focus:ring-2 focus:ring-red-200
                    min-w-52 text-left
                `}
            >
                <span
                    className={
                        selectedOption ? "text-gray-900" : "text-gray-500"
                    }
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="py-2 max-h-64 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`
                                    w-full px-8 py-4 text-lg text-left transition-colors
                                    ${
                                        option.value === value
                                            ? "bg-red-50 text-red-700 font-semibold"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }
                                    hover:bg-red-50 hover:text-red-600
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
