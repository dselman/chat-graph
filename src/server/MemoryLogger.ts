import { Logger } from "@accordproject/concerto-graph";

export type LogMessage = {
    level: 'log' | 'info' | 'success' | 'warn' | 'error',
    message: any;
    optionalParams: any[];
}

const messages:Array<LogMessage> = [];

export const MemoryLogger = {
    clear: () => {
        messages.splice(0,messages.length);
    },

    getLogMessages: () => {
        return messages;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (message?: any, ...optionalParams: any[]) => {
        messages.push( {
            level: 'log',
            message,
            optionalParams
        })
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message?: any, ...optionalParams: any[]) => {
        messages.push( {
            level: 'info',
            message,
            optionalParams
        })
    },    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: (message?: any, ...optionalParams: any[]) => {
        messages.push( {
            level: 'success',
            message,
            optionalParams
        })
    },
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message?: any, ...optionalParams: any[]) => {
        messages.push( {
            level: 'error',
            message,
            optionalParams
        })
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (message?: any, ...optionalParams: any[]) => {
        messages.push( {
            level: 'warn',
            message,
            optionalParams
        })
    }
} as Logger; 