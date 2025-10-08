export interface BaseApplicationResponse {
    type: string;
    requestId: string;
    message?: string ;
    success?: boolean ;
    data?: any;
    error?: string;
}