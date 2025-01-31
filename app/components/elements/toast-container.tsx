'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from '@nextui-org/react';

const ToastContext = createContext({ showToast: (message: string, toastStyle = "bg-primary") => { } });

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<string | null>(null);
    const [toastStyle, setToastStyle] = useState("bg-primary");

    const showToast = (message: string, toastStyle = "bg-primary") => {
        setToast(message);
        setToastStyle(toastStyle);
        setTimeout(() => setToast(null), 5000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 ${toastStyle} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-4`}>
                    <span>{toast}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
