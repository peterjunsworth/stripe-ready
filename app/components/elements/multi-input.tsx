'use client';

import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';

interface InputValue {
    name: string;
}

export default function MultiAddInputField({
    items,
    fieldName,
    fieldLabel,
    setFormData,
}: {
    items: any[];
    fieldName: string;
    fieldLabel: string;
    setFormData: Function
}) {

    const itemsArray = Array.isArray(items) ? items : JSON.parse(items);
    const allItems = itemsArray.length > 0 ? itemsArray : [{}];
    const [inputs, setInputs] = useState<any[]>(allItems);

    function setValue(fieldName: string, fieldValue: any) {
        if (!fieldName.includes('.')) return { [fieldName]: fieldValue };
        const keys = fieldName.split('.');
        let result: { [key: string]: any } = {};
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            (current as { [key: string]: any })[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = fieldValue;

        return result;
    }

    const addInput = () => {
        setInputs((prevInputs) => [...prevInputs, {}]);
    };

    const removeInput = (index: number) => {
        const updatedInputs = inputs.filter((_, i) => i !== index);
        setInputs(updatedInputs);
        setFormData((prevData: any) => ({
            ...prevData,
            ...setValue(fieldName, updatedInputs)
        }));
    };

    const handleInputChange = (value: string, index: number) => {
        const updatedInputs = [...inputs];
        updatedInputs[index] = {name: value};
        setInputs(updatedInputs);
        setFormData((prevData: any) => ({
            ...prevData,
            ...setValue(fieldName, updatedInputs)
        }));
    };

    return (
        <div className="space-y-4">
            {(inputs as InputValue[]).map((value, index) => (
                <div className="flex items-center space-x-2" key={index}>
                    <Input
                        value={value.name}
                        placeholder={fieldLabel}
                        onChange={(e) => handleInputChange(e.target.value, index)}
                        className="flex-1"
                    />
                    {index > 0 && (
                        <Button color="danger" onClick={() => removeInput(index)} className="px-4 py-2">
                            -
                        </Button>
                    )}
                    <Button onClick={addInput} className="px-4 py-2">
                        +
                    </Button>
                </div>
            ))}
        </div>
    );
}
