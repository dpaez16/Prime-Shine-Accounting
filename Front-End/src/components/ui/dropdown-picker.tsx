import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "./spinner"

interface DropdownPickerOption {
    label: string;
    value: string;
}

type DropdownPickerValue = DropdownPickerOption['value'];

interface DropdownPickerProps {
    placeholder: string;
    options: DropdownPickerOption[];
    value?: DropdownPickerValue;
    onChange: (newValue?: DropdownPickerValue) => void;
    clearable?: boolean;
    loading?: boolean;
    disabled?: boolean;
}

export const DropdownPicker: React.FC<DropdownPickerProps> = (props) => {
    const [open, setOpen] = React.useState(false);

    const value = props.value;
    const placeholder = props.placeholder;
    const options = props.options;

    const selectedLabel = value !== undefined ? options.find(option => option.value === value)?.label : placeholder;

    const renderedOptions = options.map(option => {
        const words = option.label.split(/\s+/);
        const keywords = words.flatMap(word => [word, word.toLocaleLowerCase(), word.toLocaleUpperCase()]);

        return (
            <CommandItem
                key={option.value}
                value={option.value}
                keywords={keywords}
                onSelect={(currentValue) => {
                    const unselecting = currentValue === value;

                    if (unselecting) {
                        props.clearable && props.onChange(undefined);
                    } else {
                        props.onChange(currentValue);
                    }

                    setOpen(false);
                }}
            >
                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {option.label}
            </CommandItem>
        );
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={props.disabled || props.loading}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {!props.loading && (selectedLabel ?? placeholder)}
                    {props.loading && <Spinner />}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={placeholder}  />
                    <CommandList>
                        <CommandEmpty></CommandEmpty>
                        <CommandGroup>
                            {renderedOptions}
                        </CommandGroup>
                    </CommandList>
                </Command>
                {
                    props.clearable &&
                    <Button
                        className='w-full'
                        variant='outline'
                        onClick={() => props.onChange(undefined)}
                    >
                        Clear Selection
                    </Button>
                }
            </PopoverContent>
        </Popover>
    );
};