import { cn } from "@/lib/utils";
import React from "react";

interface ErrorMessageProps {
    message?: string;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
    const message = props.message;

    if (!message) {
        return null;
    }

    return (
        <p className={cn(
            'text-destructive',
            props.className,
        )}>
            {message}
        </p>
    )
};