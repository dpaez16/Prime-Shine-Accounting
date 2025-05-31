import React from "react";
import { Label } from "./label";

interface GridFormProps {
    children?: React.ReactNode;
}

export const GridForm: React.FC<GridFormProps> = (props) => {
    return (
        <div className="grid gap-4 py-4">
            {props.children}
        </div>
    );
};

interface GridFormSectionProps {
    children?: React.ReactNode;
}

export const GridFormSection: React.FC<GridFormSectionProps> = (props) => {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            {props.children}
        </div>
    );
};

interface GridFormItemProps {
    label: string;
    children?: React.ReactNode;
    required?: boolean;
}

export const GridFormItem: React.FC<GridFormItemProps> = (props) => {
    return (
        <GridFormSection>
            <Label className='col-span-1 gap-1'>
                {props.required && <span>*</span>}
                <span>{props.label}</span>
            </Label>
            <div className='col-span-3'>
                {props.children}
            </div>
        </GridFormSection>
    );
};
